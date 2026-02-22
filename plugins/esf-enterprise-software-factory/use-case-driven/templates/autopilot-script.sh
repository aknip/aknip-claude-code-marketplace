#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# UC Autopilot Script
# Generated: {{timestamp}}
# Project: {{project_name}}
# ═══════════════════════════════════════════════════════════════════════════════
#
# Autonomous execution of all remaining phases in the milestone.
# Each phase gets fresh 200k context via prompt file + stdin redirection.
# State persists in .planning/ - safe to interrupt and resume.
#
# Architecture:
#   - Uses prompt templates from .claude/use-case-driven/templates/prompts/
#   - Generates prompt files with placeholders substituted at runtime
#   - Calls: claude --print --output-format stream-json (streaming JSON output)
#   - Real-time progress via stream processing (no named pipes/FIFO)
#   - File-based state in .planning/logs/.display/
#
# Features:
#   - Real-time activity display via stream-json parsing
#   - Stage tracking (research -> planning -> building -> verifying)
#   - Git safety checks (no uncommitted files left behind)
#   - Phase context display (what we're building and why)
#   - Accurate token/cost tracking from JSON output
#
# Dependencies:
#   - jq (JSON processor): brew install jq (macOS) or apt install jq (Linux)
#
# Usage:
#   bash .planning/autopilot.sh              # Run attached
#   nohup bash .planning/autopilot.sh &      # Run in background
#
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# Signal to UC commands that we're in autopilot mode
export UC_AUTOPILOT=1

# ─────────────────────────────────────────────────────────────────────────────
# Configuration (filled by /esf:autopilot)
# ─────────────────────────────────────────────────────────────────────────────

PROJECT_DIR="{{project_dir}}"
PROJECT_NAME="{{project_name}}"
PHASES=({{phases}})
CHECKPOINT_MODE="{{checkpoint_mode}}"
MAX_RETRIES={{max_retries}}
BUDGET_LIMIT={{budget_limit}}
WEBHOOK_URL="{{webhook_url}}"
MODEL_PROFILE="{{model_profile}}"

# ─────────────────────────────────────────────────────────────────────────────
# Derived paths
# ─────────────────────────────────────────────────────────────────────────────

LOG_DIR="$PROJECT_DIR/.planning/logs"
PROMPT_TEMPLATES_DIR="$PROJECT_DIR/.claude/use-case-driven/templates/prompts"
CHECKPOINT_DIR="$PROJECT_DIR/.planning/checkpoints"
STATE_FILE="$PROJECT_DIR/.planning/STATE.md"

# Track execution state for signal handling
EXECUTING=0
export UC_PROJECT_DIR="$PROJECT_DIR"
export UC_LOG_DIR="$LOG_DIR"

# ─────────────────────────────────────────────────────────────────────────────
# Setup
# ─────────────────────────────────────────────────────────────────────────────

cd "$PROJECT_DIR"
mkdir -p "$LOG_DIR" "$CHECKPOINT_DIR/pending" "$CHECKPOINT_DIR/approved"

# Check for required dependencies
if ! command -v jq &> /dev/null; then
  echo "ERROR: jq is required for stream processing"
  echo "Install with: brew install jq (macOS) or apt install jq (Linux)"
  exit 1
fi

# Lock directory (atomic creation prevents race condition)
LOCK_DIR="$PROJECT_DIR/.planning/autopilot.lock.d"
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "ERROR: Autopilot already running (lock exists: $LOCK_DIR)"
  echo "If previous run crashed, remove manually: rmdir '$LOCK_DIR'"
  exit 1
fi

cleanup() {
  # Kill background processes
  [ -n "${DISPLAY_PID:-}" ] && kill $DISPLAY_PID 2>/dev/null || true

  # Only remove lock on final exit, not during retries
  if [ "$EXECUTING" -eq 0 ]; then
    rmdir "$LOCK_DIR" 2>/dev/null || true
  fi

  # Restore cursor
  printf "\033[?25h" 2>/dev/null
}

handle_interrupt() {
  log "WARN" "Interrupt received - will retry or exit gracefully"
  # Don't exit immediately - let the retry logic handle it
}

trap cleanup EXIT
trap handle_interrupt INT TERM

# ─────────────────────────────────────────────────────────────────────────────
# Cross-platform helpers
# ─────────────────────────────────────────────────────────────────────────────

iso_timestamp() {
  date '+%Y-%m-%dT%H:%M:%S%z'
}

elapsed_since() {
  local start=$1
  local now=$(date +%s)
  local elapsed=$((now - start))
  local min=$((elapsed / 60))
  local sec=$((elapsed % 60))
  printf "%d:%02d" $min $sec
}

# ─────────────────────────────────────────────────────────────────────────────
# Prompt Generation
# ─────────────────────────────────────────────────────────────────────────────
#
# Generates prompt files from templates by substituting placeholders.
# This replaces the slash command pattern which only works in interactive mode.
#
# Usage: generate_prompt <template_name> <output_file> <phase>
#
# Templates are in: .claude/use-case-driven/templates/prompts/
# Placeholders: {{PHASE}}, {{PROJECT_DIR}}, {{PADDED_PHASE}}, {{PHASE_DIR}}, {{PHASE_NAME}}
#

generate_prompt() {
  local template_name="$1"
  local output_file="$2"
  local phase="${3:-}"
  local version="${4:-}"

  local template_file="$PROMPT_TEMPLATES_DIR/$template_name"

  if [ ! -f "$template_file" ]; then
    log "ERROR" "Prompt template not found: $template_file"
    return 1
  fi

  # Compute phase-specific values
  local padded_phase=""
  local phase_dir=""
  local phase_name=""

  if [ -n "$phase" ]; then
    padded_phase=$(printf "%02d" "$phase" 2>/dev/null || echo "$phase")
    phase_dir=$(ls -d "$PROJECT_DIR/.planning/phases/${padded_phase}-"* 2>/dev/null | head -1)
    if [ -z "$phase_dir" ]; then
      phase_dir=".planning/phases/${padded_phase}-unknown"
    fi
    # Extract just the relative path from PROJECT_DIR
    phase_dir="${phase_dir#$PROJECT_DIR/}"
    phase_name=$(basename "$phase_dir" | sed "s/^${padded_phase}-//")
  fi

  # Substitute placeholders
  sed -e "s|{{PHASE}}|${phase}|g" \
      -e "s|{{PROJECT_DIR}}|${PROJECT_DIR}|g" \
      -e "s|{{PADDED_PHASE}}|${padded_phase}|g" \
      -e "s|{{PHASE_DIR}}|${phase_dir}|g" \
      -e "s|{{PHASE_NAME}}|${phase_name}|g" \
      -e "s|{{VERSION}}|${version}|g" \
      "$template_file" > "$output_file"

  log "INFO" "Generated prompt: $output_file"
  return 0
}

# ─────────────────────────────────────────────────────────────────────────────
# Stream Processing
# ─────────────────────────────────────────────────────────────────────────────

# Helper to update activity file with rich formatting
update_activity_file() {
  local type="$1"
  local detail="$2"

  local prefix=""
  local color_code=""
  case "$type" in
    read)     prefix="📖 read  " ;;
    write)    prefix="📝 write " ;;
    edit)     prefix="✏️  edit  " ;;
    bash)     prefix="⚡ bash  " ;;
    agent)    prefix="🤖 agent " ;;
    search)   prefix="🔍 search" ;;
    text)     prefix="💭 think " ;;
    result)   prefix="✅ done  " ;;
    error)    prefix="❌ ERROR " ;;
    info)     prefix="ℹ️  info  " ;;
    *)        prefix="   ...   " ;;
  esac

  # Truncate long messages
  if [ ${#detail} -gt 50 ]; then
    detail="${detail:0:47}..."
  fi

  # Append to activity file
  echo "$prefix $detail" >> "$DISPLAY_STATE_DIR/activity"

  # Keep only last N lines
  if [ -f "$DISPLAY_STATE_DIR/activity" ]; then
    tail -n $MAX_ACTIVITY_LINES "$DISPLAY_STATE_DIR/activity" > "$DISPLAY_STATE_DIR/activity.tmp" 2>/dev/null
    mv "$DISPLAY_STATE_DIR/activity.tmp" "$DISPLAY_STATE_DIR/activity" 2>/dev/null
  fi
}

# Update the current working status line
update_working_status() {
  local status="$1"
  echo "$status" > "$DISPLAY_STATE_DIR/working_status"
}

# Extract a short summary from text (first meaningful sentence/phrase)
extract_text_summary() {
  local text="$1"
  local max_len="${2:-60}"

  # Remove leading/trailing whitespace and newlines
  text=$(echo "$text" | tr '\n' ' ' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

  # Skip very short fragments
  [ ${#text} -lt 10 ] && return

  # Skip tool call announcements (these are redundant)
  echo "$text" | grep -qE "^(Let me|I'll|I will|Now I)" && return

  # Truncate
  if [ ${#text} -gt $max_len ]; then
    text="${text:0:$((max_len - 3))}..."
  fi

  echo "$text"
}

process_stream_output() {
  local log_file="$1"
  local tool_count=0
  local text_chunks=0
  local accumulated_text=""
  local current_agent=""
  local last_text_update=0

  # Ensure display state dir exists
  mkdir -p "$DISPLAY_STATE_DIR"
  echo "$(date +%s)" > "$DISPLAY_STATE_DIR/last_activity"
  echo "" > "$DISPLAY_STATE_DIR/working_status"
  echo "" > "$DISPLAY_STATE_DIR/current_agent"

  while IFS= read -r line; do
    # Log raw JSON line
    echo "$line" >> "$log_file"

    # Skip empty lines
    [ -z "$line" ] && continue

    # Update activity timestamp
    local now=$(date +%s)
    echo "$now" > "$DISPLAY_STATE_DIR/last_activity"

    # Try to parse as JSON
    if ! echo "$line" | jq -e . >/dev/null 2>&1; then
      # Non-JSON line (stderr or other output)
      log "STREAM" "Non-JSON: ${line:0:100}"
      continue
    fi

    local event_type=$(echo "$line" | jq -r '.type // empty' 2>/dev/null)

    case "$event_type" in
      "system")
        # Initialization event
        local subtype=$(echo "$line" | jq -r '.subtype // empty' 2>/dev/null)
        if [ "$subtype" = "init" ]; then
          local model=$(echo "$line" | jq -r '.model // "unknown"' 2>/dev/null)
          update_activity_file "info" "Session started (${model})"
          log "STREAM" "Init: model=$model"
        fi
        ;;

      "assistant")
        # Assistant message with tool calls or text
        local content_array=$(echo "$line" | jq -c '.message.content // []' 2>/dev/null)

        # Process each content block
        echo "$content_array" | jq -c '.[]' 2>/dev/null | while read -r content_block; do
          local block_type=$(echo "$content_block" | jq -r '.type // empty' 2>/dev/null)

          case "$block_type" in
            "text")
              # Claude's thinking/response text
              local text=$(echo "$content_block" | jq -r '.text // empty' 2>/dev/null)
              if [ -n "$text" ]; then
                local summary=$(extract_text_summary "$text" 55)
                if [ -n "$summary" ]; then
                  update_activity_file "text" "$summary"
                  update_working_status "$summary"
                fi
              fi
              ;;

            "tool_use")
              local tool_name=$(echo "$content_block" | jq -r '.name // empty' 2>/dev/null)
              local tool_input=$(echo "$content_block" | jq -c '.input // {}' 2>/dev/null)

              [ -z "$tool_name" ] && continue

              # Extract tool-specific details
              local detail=""
              local activity_type="info"

              case "$tool_name" in
                Read)
                  activity_type="read"
                  local file_path=$(echo "$tool_input" | jq -r '.file_path // empty' 2>/dev/null)
                  if [ -n "$file_path" ]; then
                    # Show relative path or just filename
                    local short_path="${file_path##*/}"
                    local parent_dir=$(dirname "$file_path" | sed 's/.*\///')
                    detail="$parent_dir/$short_path"
                  else
                    detail="(file)"
                  fi
                  ;;

                Write)
                  activity_type="write"
                  local file_path=$(echo "$tool_input" | jq -r '.file_path // empty' 2>/dev/null)
                  if [ -n "$file_path" ]; then
                    local short_path="${file_path##*/}"
                    detail="$short_path"
                  else
                    detail="(new file)"
                  fi
                  ;;

                Edit)
                  activity_type="edit"
                  local file_path=$(echo "$tool_input" | jq -r '.file_path // empty' 2>/dev/null)
                  if [ -n "$file_path" ]; then
                    local short_path="${file_path##*/}"
                    detail="$short_path"
                  else
                    detail="(file)"
                  fi
                  ;;

                Bash)
                  activity_type="bash"
                  # Try to get description first, then command
                  local bash_desc=$(echo "$tool_input" | jq -r '.description // empty' 2>/dev/null)
                  local bash_cmd=$(echo "$tool_input" | jq -r '.command // empty' 2>/dev/null)
                  if [ -n "$bash_desc" ]; then
                    detail="$bash_desc"
                  elif [ -n "$bash_cmd" ]; then
                    # Extract first command/word
                    detail=$(echo "$bash_cmd" | head -1 | cut -c1-45)
                  else
                    detail="(command)"
                  fi
                  ;;

                Task)
                  activity_type="agent"
                  local agent_type=$(echo "$tool_input" | jq -r '.subagent_type // empty' 2>/dev/null)
                  local agent_desc=$(echo "$tool_input" | jq -r '.description // empty' 2>/dev/null)

                  if [ -n "$agent_type" ]; then
                    echo "$agent_type" > "$DISPLAY_STATE_DIR/current_agent"

                    # Map agent type to friendly name
                    case "$agent_type" in
                      uc-phase-researcher) detail="Researching phase..." ;;
                      uc-planner)           detail="Creating plans..." ;;
                      uc-checker)           detail="Checking plans..." ;;
                      uc-executor)          detail="Executing tasks..." ;;
                      uc-verifier)          detail="Verifying results..." ;;
                      Explore)              detail="Exploring codebase..." ;;
                      Plan)                 detail="Planning approach..." ;;
                      *)                    detail="$agent_type" ;;
                    esac

                    if [ -n "$agent_desc" ]; then
                      detail="$agent_type: $agent_desc"
                    fi
                  else
                    detail="(spawning agent)"
                  fi
                  ;;

                Grep)
                  activity_type="search"
                  local pattern=$(echo "$tool_input" | jq -r '.pattern // empty' 2>/dev/null)
                  if [ -n "$pattern" ]; then
                    detail="grep: ${pattern:0:35}"
                  else
                    detail="grep"
                  fi
                  ;;

                Glob)
                  activity_type="search"
                  local pattern=$(echo "$tool_input" | jq -r '.pattern // empty' 2>/dev/null)
                  if [ -n "$pattern" ]; then
                    detail="glob: ${pattern:0:35}"
                  else
                    detail="glob"
                  fi
                  ;;

                TaskCreate|TaskUpdate|TaskList)
                  activity_type="info"
                  detail="Managing tasks..."
                  ;;

                WebFetch|WebSearch)
                  activity_type="search"
                  local url=$(echo "$tool_input" | jq -r '.url // empty' 2>/dev/null)
                  local query=$(echo "$tool_input" | jq -r '.query // empty' 2>/dev/null)
                  if [ -n "$url" ]; then
                    detail="fetch: ${url:0:35}"
                  elif [ -n "$query" ]; then
                    detail="search: ${query:0:35}"
                  else
                    detail="web request"
                  fi
                  ;;

                *)
                  detail="$tool_name"
                  ;;
              esac

              update_activity_file "$activity_type" "$detail"
              update_working_status "$tool_name: $detail"
              log "STREAM" "Tool: $tool_name - $detail"
              ;;
          esac
        done
        ;;

      "user")
        # Tool result event
        local tool_result=$(echo "$line" | jq -r '.tool_use_result.type // empty' 2>/dev/null)
        if [ "$tool_result" = "text" ]; then
          # Check if it was a file read result
          local file_path=$(echo "$line" | jq -r '.tool_use_result.file.filePath // empty' 2>/dev/null)
          if [ -n "$file_path" ]; then
            local num_lines=$(echo "$line" | jq -r '.tool_use_result.file.numLines // 0' 2>/dev/null)
            local short_path="${file_path##*/}"
            update_activity_file "result" "Read $short_path ($num_lines lines)"
          fi
        fi
        ;;

      "result")
        # Final result event
        local subtype=$(echo "$line" | jq -r '.subtype // empty' 2>/dev/null)
        local is_error=$(echo "$line" | jq -r '.is_error // false' 2>/dev/null)
        local num_turns=$(echo "$line" | jq -r '.num_turns // 0' 2>/dev/null)
        local cost=$(echo "$line" | jq -r '.total_cost_usd // 0' 2>/dev/null)

        # Extract token usage
        local input_tokens=$(echo "$line" | jq -r '.usage.input_tokens // 0' 2>/dev/null)
        local output_tokens=$(echo "$line" | jq -r '.usage.output_tokens // 0' 2>/dev/null)
        local cache_read=$(echo "$line" | jq -r '.usage.cache_read_input_tokens // 0' 2>/dev/null)
        local total=$((input_tokens + output_tokens + cache_read))

        echo "$total" > "$DISPLAY_STATE_DIR/tokens"

        if [ "$is_error" = "true" ]; then
          update_activity_file "error" "Session ended with error"
        else
          # Format cost nicely
          local cost_display=$(printf "%.2f" "$cost" 2>/dev/null || echo "$cost")
          update_activity_file "result" "Done: $num_turns turns, \$$cost_display"
        fi

        log "STREAM" "Result: turns=$num_turns cost=$cost tokens=$total"
        ;;

      "error")
        local error_msg=$(echo "$line" | jq -r '.error.message // .message // "Unknown error"' 2>/dev/null)
        log "ERROR" "Stream error: $error_msg"
        update_activity_file "error" "${error_msg:0:45}"
        ;;

      *)
        # Log unknown event types for debugging
        if [ -n "$event_type" ]; then
          log "STREAM" "Unknown event type: $event_type"
        fi
        ;;
    esac
  done

  log "STREAM" "Stream ended. Tools processed."
  return 0
}

# Run claude with a prompt file using stream-json output
run_claude_with_prompt() {
  local prompt_file="$1"
  local log_file="$2"

  if [ ! -f "$prompt_file" ]; then
    log "ERROR" "Prompt file not found: $prompt_file"
    return 1
  fi

  log "INFO" "Running claude with prompt: $prompt_file"
  log "INFO" "Log file: $log_file"
  log "INFO" "Prompt size: $(wc -c < "$prompt_file") bytes"

  # Initialize activity display
  echo "WORKING" > "$DISPLAY_STATE_DIR/current_stage"
  echo "Processing prompt..." > "$DISPLAY_STATE_DIR/stage_desc"
  echo "$(date +%s)" > "$DISPLAY_STATE_DIR/stage_start"
  echo "$(date +%s)" > "$DISPLAY_STATE_DIR/last_activity"

  # Run claude with streaming JSON output
  # The process_stream_output function handles real-time updates
  claude --dangerously-skip-permissions \
         --print \
         --verbose \
         --output-format stream-json \
         --include-partial-messages \
         --allowedTools "Read,Write,Edit,Glob,Grep,Bash,Task,TaskCreate,TaskUpdate,TaskList,AskUserQuestion" \
         < "$prompt_file" 2>&1 | process_stream_output "$log_file"

  local exit_code=${PIPESTATUS[0]}

  log "INFO" "Claude exit code: $exit_code"

  # Read final token count if available
  if [ -f "$DISPLAY_STATE_DIR/tokens" ]; then
    local tokens=$(cat "$DISPLAY_STATE_DIR/tokens" 2>/dev/null)
    log "INFO" "Total tokens: $tokens"
  fi

  log "INFO" "Output size: $(wc -c < "$log_file" 2>/dev/null || echo 0) bytes"

  return $exit_code
}

# ─────────────────────────────────────────────────────────────────────────────
# Terminal UI
# ─────────────────────────────────────────────────────────────────────────────

# Colors and formatting (auto-disabled if not a terminal)
if [ -t 1 ]; then
  C_RESET='\033[0m'
  C_BOLD='\033[1m'
  C_DIM='\033[2m'
  C_RED='\033[31m'
  C_GREEN='\033[32m'
  C_YELLOW='\033[33m'
  C_BLUE='\033[34m'
  C_CYAN='\033[36m'
  C_WHITE='\033[37m'
  CURSOR_HOME='\033[H'
  CURSOR_CLEAR='\033[J'
  CURSOR_LINE_CLEAR='\033[K'
  CURSOR_HIDE='\033[?25l'
  CURSOR_SHOW='\033[?25h'
else
  C_RESET='' C_BOLD='' C_DIM='' C_RED='' C_GREEN='' C_YELLOW=''
  C_BLUE='' C_CYAN='' C_WHITE=''
  CURSOR_HOME='' CURSOR_CLEAR='' CURSOR_LINE_CLEAR=''
  CURSOR_HIDE='' CURSOR_SHOW=''
fi

# ─────────────────────────────────────────────────────────────────────────────
# Display State (shared via temp files for subprocess communication)
# ─────────────────────────────────────────────────────────────────────────────

DISPLAY_STATE_DIR="$LOG_DIR/.display"
mkdir -p "$DISPLAY_STATE_DIR"

# Initialize display state files
echo "" > "$DISPLAY_STATE_DIR/current_stage"
echo "" > "$DISPLAY_STATE_DIR/stage_desc"
echo "0" > "$DISPLAY_STATE_DIR/stage_start"
echo "" > "$DISPLAY_STATE_DIR/completed_stages"
echo "" > "$DISPLAY_STATE_DIR/activity"
echo "" > "$DISPLAY_STATE_DIR/working_status"
echo "" > "$DISPLAY_STATE_DIR/current_agent"
echo "0" > "$DISPLAY_STATE_DIR/tokens"

MAX_ACTIVITY_LINES=10

# ─────────────────────────────────────────────────────────────────────────────
# Stage Management
# ─────────────────────────────────────────────────────────────────────────────

stage_display_name() {
  local subagent_type="$1"
  case "$subagent_type" in
    uc-phase-researcher)  echo "RESEARCH" ;;
    uc-planner)           echo "PLANNING" ;;
    uc-checker)           echo "CHECKING" ;;
    uc-executor)          echo "BUILDING" ;;
    uc-verifier)          echo "VERIFYING" ;;
    *)                    echo "WORKING" ;;
  esac
}

set_stage() {
  local subagent_type="$1"
  local description="$2"

  # Complete previous stage if exists
  local prev_stage=$(cat "$DISPLAY_STATE_DIR/current_stage" 2>/dev/null)
  if [ -n "$prev_stage" ] && [ "$prev_stage" != "" ]; then
    local prev_start=$(cat "$DISPLAY_STATE_DIR/stage_start" 2>/dev/null)
    if [ -n "$prev_start" ] && [ "$prev_start" != "0" ]; then
      local elapsed=$(elapsed_since "$prev_start")
      echo "$prev_stage:$elapsed" >> "$DISPLAY_STATE_DIR/completed_stages"
    fi
  fi

  local stage_name=$(stage_display_name "$subagent_type")
  echo "$stage_name" > "$DISPLAY_STATE_DIR/current_stage"
  echo "$description" > "$DISPLAY_STATE_DIR/stage_desc"
  echo "$(date +%s)" > "$DISPLAY_STATE_DIR/stage_start"
  echo "$(date +%s)" > "$DISPLAY_STATE_DIR/last_activity"

  log "STAGE" "Set stage: $stage_name - $description"
}

complete_current_stage() {
  local curr_stage=$(cat "$DISPLAY_STATE_DIR/current_stage" 2>/dev/null)
  if [ -n "$curr_stage" ]; then
    local stage_start=$(cat "$DISPLAY_STATE_DIR/stage_start" 2>/dev/null)
    local elapsed=$(elapsed_since "$stage_start")
    echo "$curr_stage:$elapsed" >> "$DISPLAY_STATE_DIR/completed_stages"
    echo "" > "$DISPLAY_STATE_DIR/current_stage"
    echo "" > "$DISPLAY_STATE_DIR/stage_desc"
  fi
}

reset_stages() {
  echo "" > "$DISPLAY_STATE_DIR/current_stage"
  echo "" > "$DISPLAY_STATE_DIR/stage_desc"
  echo "0" > "$DISPLAY_STATE_DIR/stage_start"
  echo "" > "$DISPLAY_STATE_DIR/completed_stages"
  echo "" > "$DISPLAY_STATE_DIR/activity"
  echo "" > "$DISPLAY_STATE_DIR/working_status"
  echo "" > "$DISPLAY_STATE_DIR/current_agent"
  echo "0" > "$DISPLAY_STATE_DIR/tokens"
}

# ─────────────────────────────────────────────────────────────────────────────
# Activity Feed
# ─────────────────────────────────────────────────────────────────────────────

add_activity() {
  local type="$1"
  local detail="$2"

  local prefix=""
  case "$type" in
    read)   prefix="📖 read  " ;;
    write)  prefix="📝 write " ;;
    edit)   prefix="✏️  edit  " ;;
    commit) prefix="💾 commit" ;;
    test)   prefix="🧪 test  " ;;
    bash)   prefix="⚡ bash  " ;;
    agent)  prefix="🤖 agent " ;;
    retry)  prefix="🔄 retry " ;;
    info)   prefix="ℹ️  info  " ;;
    result) prefix="✅ done  " ;;
    error)  prefix="❌ ERROR " ;;
    *)      prefix="   ...   " ;;
  esac

  # Truncate long paths/messages
  if [ ${#detail} -gt 50 ]; then
    detail="${detail:0:47}..."
  fi

  # Append to activity file, keep last N lines
  echo "$prefix $detail" >> "$DISPLAY_STATE_DIR/activity"
  tail -n $MAX_ACTIVITY_LINES "$DISPLAY_STATE_DIR/activity" > "$DISPLAY_STATE_DIR/activity.tmp" 2>/dev/null
  mv "$DISPLAY_STATE_DIR/activity.tmp" "$DISPLAY_STATE_DIR/activity" 2>/dev/null || true

  # Update last activity timestamp
  echo "$(date +%s)" > "$DISPLAY_STATE_DIR/last_activity"
}

# ─────────────────────────────────────────────────────────────────────────────
# Phase Context
# ─────────────────────────────────────────────────────────────────────────────

CURRENT_PHASE=""
CURRENT_PHASE_NAME=""
CURRENT_PHASE_CONTEXT=""

load_phase_context() {
  local phase="$1"
  local roadmap=".planning/ROADMAP.md"

  [ ! -f "$roadmap" ] && return

  # Extract phase name
  CURRENT_PHASE_NAME=$(grep -E "Phase $phase:" "$roadmap" 2>/dev/null | head -1 | sed 's/.*Phase [0-9]*: //' | sed 's/ *$//' | sed 's/\*//g')
  [ -z "$CURRENT_PHASE_NAME" ] && CURRENT_PHASE_NAME="Phase $phase"

  # Extract goal and deliverables
  local in_phase=0
  local context=""
  local line_count=0

  while IFS= read -r line; do
    if echo "$line" | grep -qE "Phase $phase:"; then
      in_phase=1
      continue
    fi

    if [ $in_phase -eq 1 ]; then
      # Stop at next phase
      if echo "$line" | grep -qE "^###.*Phase [0-9]"; then
        break
      fi

      # Capture goal
      if echo "$line" | grep -q "Goal:"; then
        context=$(echo "$line" | sed 's/.*Goal:[[:space:]]*//' | sed 's/\*//g')
      fi

      # Capture must-haves (first few)
      if echo "$line" | grep -qE "^[[:space:]]*-[[:space:]]" && [ $line_count -lt 4 ]; then
        local item=$(echo "$line" | sed 's/^[[:space:]]*-[[:space:]]*//' | sed 's/\*//g')
        if [ -n "$item" ]; then
          context="$context
  $item"
          ((line_count++))
        fi
      fi
    fi
  done < "$roadmap"

  CURRENT_PHASE_CONTEXT="$context"
}

# ─────────────────────────────────────────────────────────────────────────────
# Display Rendering
# ─────────────────────────────────────────────────────────────────────────────

render_display() {
  local total_phases=$1
  local current_idx=$2

  # Read current state from files
  local current_stage=$(cat "$DISPLAY_STATE_DIR/current_stage" 2>/dev/null)
  local stage_desc=$(cat "$DISPLAY_STATE_DIR/stage_desc" 2>/dev/null)
  local stage_start=$(cat "$DISPLAY_STATE_DIR/stage_start" 2>/dev/null)
  local working_status=$(cat "$DISPLAY_STATE_DIR/working_status" 2>/dev/null)
  local current_agent=$(cat "$DISPLAY_STATE_DIR/current_agent" 2>/dev/null)

  # Header
  printf "${C_BOLD}${C_CYAN}"
  printf "# C AUTOPILOT"
  printf "%*s" $((50 - ${#PROJECT_NAME})) ""
  printf "Phase %s/%s\n" "$((current_idx + 1))" "$total_phases"
  printf "${C_RESET}\n"

  # Phase info
  printf "## ${C_BOLD}${C_WHITE}PHASE %s: %s${C_RESET}\n" "$CURRENT_PHASE" "$CURRENT_PHASE_NAME"
  printf "\n"

  # Phase context (if available)
  if [ -n "$CURRENT_PHASE_CONTEXT" ]; then
    echo "$CURRENT_PHASE_CONTEXT" | head -4 | while IFS= read -r line; do
      printf "${C_DIM}%s${C_RESET}\n" "$line"
    done
    printf "\n"
  fi

  # Completed stages
  if [ -f "$DISPLAY_STATE_DIR/completed_stages" ] && [ -s "$DISPLAY_STATE_DIR/completed_stages" ]; then
    while IFS= read -r stage_entry; do
      [ -z "$stage_entry" ] && continue
      local stage_name="${stage_entry%%:*}"
      local stage_time="${stage_entry##*:}"
      printf "${C_DIM}✓ %-10s%48s${C_RESET}\n" "$stage_name" "$stage_time"
    done < "$DISPLAY_STATE_DIR/completed_stages"
    printf "\n"
  fi

  # Current stage/working section
  printf "## ${C_WHITE}${C_BOLD}"
  if [ -n "$current_stage" ]; then
    printf "%s" "$current_stage"
  else
    printf "WORKING"
  fi

  local elapsed=""
  if [ -n "$stage_start" ] && [ "$stage_start" != "0" ]; then
    elapsed=$(elapsed_since "$stage_start")
    printf " %s" "$elapsed"
  fi
  printf "${C_RESET}\n\n"

  # Show current agent if any
  if [ -n "$current_agent" ]; then
    local agent_display=""
    case "$current_agent" in
      uc-phase-researcher) agent_display="🔬 Phase Researcher" ;;
      uc-planner)          agent_display="📋 Planner" ;;
      uc-checker)          agent_display="✅ Checker" ;;
      uc-executor)         agent_display="🔨 Executor" ;;
      uc-verifier)         agent_display="🔍 Verifier" ;;
      Explore)             agent_display="🧭 Explorer" ;;
      Plan)                agent_display="🗺️  Planner" ;;
      Bash)                agent_display="⚡ Shell" ;;
      *)                   agent_display="🤖 $current_agent" ;;
    esac
    printf "${C_CYAN}Agent: ${C_WHITE}%s${C_RESET}\n" "$agent_display"
  fi

  # Show working status (what Claude is currently doing)
  if [ -n "$working_status" ]; then
    # Truncate if needed
    if [ ${#working_status} -gt 58 ]; then
      working_status="${working_status:0:55}..."
    fi
    printf "${C_DIM}%s${C_RESET}\n" "$working_status"
  elif [ -n "$stage_desc" ]; then
    if [ ${#stage_desc} -gt 58 ]; then
      stage_desc="${stage_desc:0:55}..."
    fi
    printf "${C_DIM}%s${C_RESET}\n" "$stage_desc"
  fi

  printf "\n"

  # Activity feed section
  printf "## Activity:\n\n"

  local activity_count=0
  local last_activity_time=""

  # Check activity staleness
  if [ -f "$DISPLAY_STATE_DIR/last_activity" ]; then
    last_activity_time=$(cat "$DISPLAY_STATE_DIR/last_activity" 2>/dev/null)
    local now=$(date +%s)
    local age=$((now - ${last_activity_time:-0}))

    if [ $age -gt 30 ]; then
      printf "${C_YELLOW}⏳ waiting for response (${age}s)${C_RESET}\n"
      ((activity_count++))
    fi
  fi

  if [ -f "$DISPLAY_STATE_DIR/activity" ] && [ -s "$DISPLAY_STATE_DIR/activity" ]; then
    while IFS= read -r line; do
      [ -z "$line" ] && continue
      # Color code based on prefix
      if echo "$line" | grep -q "^❌"; then
        printf "${C_RED}%s${C_RESET}\n" "$line"
      elif echo "$line" | grep -q "^✅"; then
        printf "${C_GREEN}%s${C_RESET}\n" "$line"
      elif echo "$line" | grep -q "^🤖"; then
        printf "${C_CYAN}%s${C_RESET}\n" "$line"
      elif echo "$line" | grep -q "^⚡"; then
        printf "${C_YELLOW}%s${C_RESET}\n" "$line"
      elif echo "$line" | grep -q "^💭"; then
        printf "${C_DIM}%s${C_RESET}\n" "$line"
      else
        printf "%s\n" "$line"
      fi
      ((activity_count++))
    done < "$DISPLAY_STATE_DIR/activity"
  fi

  if [ $activity_count -eq 0 ]; then
    printf "${C_DIM}starting...${C_RESET}\n"
    activity_count=1
  fi

  # Pad to consistent height
  local pad_lines=$((MAX_ACTIVITY_LINES - activity_count))
  for ((i=0; i<pad_lines && i<3; i++)); do
    printf "\n"
  done

  printf "\n"

  # Progress bar
  local completed=$current_idx
  local bar_width=40
  local filled=$((completed * bar_width / total_phases))
  [ $filled -lt 0 ] && filled=0
  local empty=$((bar_width - filled))
  [ $empty -lt 0 ] && empty=0

  printf "## Progress "
  printf "${C_DIM}["
  printf "${C_CYAN}"
  for ((i=0; i<filled; i++)); do printf "━"; done
  printf "${C_DIM}"
  for ((i=0; i<empty; i++)); do printf "─"; done
  printf "]${C_RESET}"
  printf " %d/%d phases\n" "$completed" "$total_phases"

  # Show token count if available
  if [ -f "$DISPLAY_STATE_DIR/tokens" ]; then
    local tokens=$(cat "$DISPLAY_STATE_DIR/tokens" 2>/dev/null)
    if [ -n "$tokens" ] && [ "$tokens" != "0" ]; then
      # Format with K suffix for readability
      if [ "$tokens" -gt 1000 ]; then
        local k_tokens=$((tokens / 1000))
        printf "${C_DIM}Tokens: ~${k_tokens}K${C_RESET}\n"
      else
        printf "${C_DIM}Tokens: ${tokens}${C_RESET}\n"
      fi
    fi
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Display Refresh (file-based polling)
# ─────────────────────────────────────────────────────────────────────────────

DISPLAY_PID=""

start_display_refresh() {
  local total_phases=$1
  local phase_idx=$2

  # Only start display refresh in terminal mode
  if [ -t 1 ]; then
    (
      local last_activity=0
      local stall_count=0

      while true; do
        # Check for activity staleness
        if [ -f "$DISPLAY_STATE_DIR/last_activity" ]; then
          local current_activity=$(cat "$DISPLAY_STATE_DIR/last_activity" 2>/dev/null || echo "0")
          if [ "$current_activity" = "$last_activity" ]; then
            ((stall_count++))
            if [ $stall_count -ge 120 ]; then  # 60 seconds at 0.5s interval
              add_activity "info" "Waiting for Claude..."
              stall_count=0
            fi
          else
            last_activity="$current_activity"
            stall_count=0
          fi
        fi

        # Render display
        printf "${CURSOR_HOME}${CURSOR_CLEAR}"
        render_display "$total_phases" "$phase_idx"

        sleep 0.5
      done
    ) &
    DISPLAY_PID=$!

    log "INFO" "Started display refresh (PID: $DISPLAY_PID)"
  fi
}

stop_display_refresh() {
  if [ -n "$DISPLAY_PID" ]; then
    kill $DISPLAY_PID 2>/dev/null || true
    wait $DISPLAY_PID 2>/dev/null || true
    DISPLAY_PID=""
    log "INFO" "Stopped display refresh"
  fi
}

# Backwards compatibility aliases
start_activity_reader() {
  start_display_refresh "$@"
}

stop_activity_reader() {
  stop_display_refresh
}

# ─────────────────────────────────────────────────────────────────────────────
# Logging & Notifications
# ─────────────────────────────────────────────────────────────────────────────

log() {
  local level="$1"
  local message="$2"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

  # Always write to log file
  echo "[$timestamp] [$level] $message" >> "$LOG_DIR/autopilot.log"
}

notify() {
  local message="$1"
  local status="${2:-info}"

  log "NOTIFY" "$message"

  # Terminal bell
  printf "\a"

  # Webhook if configured
  if [ -n "$WEBHOOK_URL" ]; then
    curl -s -X POST "$WEBHOOK_URL" \
      -H "Content-Type: application/json" \
      -d "{\"text\": \"UC Autopilot [$PROJECT_NAME]: $message\", \"status\": \"$status\"}" \
      > /dev/null 2>&1 || true
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Git Safety
# ─────────────────────────────────────────────────────────────────────────────

check_uncommitted_files() {
  local context="$1"

  # Check for uncommitted changes
  if ! git diff --quiet HEAD 2>/dev/null || ! git diff --cached --quiet 2>/dev/null; then
    local uncommitted=$(git status --short 2>/dev/null)

    log "WARN" "Uncommitted files detected ($context)"
    log "WARN" "$uncommitted"

    # Create safety commit
    git add -A 2>/dev/null
    git commit -m "wip(autopilot): uncommitted files from $context

Autopilot detected uncommitted files that would otherwise be lost.
Review and squash/revert as appropriate.
" 2>/dev/null || true

    log "INFO" "Created safety commit for orphaned files"
    add_activity "commit" "wip: safety commit"
    return 1
  fi
  return 0
}

ensure_clean_working_tree() {
  local context="$1"
  check_uncommitted_files "$context" || true
}

# ─────────────────────────────────────────────────────────────────────────────
# State Management
# ─────────────────────────────────────────────────────────────────────────────

update_autopilot_state() {
  local mode="$1"
  local phase="$2"
  local remaining="$3"
  local error="${4:-none}"

  if grep -q "## Autopilot" "$STATE_FILE" 2>/dev/null; then
    awk -v mode="$mode" -v phase="$phase" -v remaining="$remaining" -v error="$error" -v ts="$(iso_timestamp)" '
      /^## Autopilot/,/^## / {
        if (/^- \*\*Mode:\*\*/) { print "- **Mode:** " mode; next }
        if (/^- \*\*Current Phase:\*\*/) { print "- **Current Phase:** " phase; next }
        if (/^- \*\*Phases Remaining:\*\*/) { print "- **Phases Remaining:** " remaining; next }
        if (/^- \*\*Last Error:\*\*/) { print "- **Last Error:** " error; next }
        if (/^- \*\*Updated:\*\*/) { print "- **Updated:** " ts; next }
      }
      { print }
    ' "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"
  else
    cat >> "$STATE_FILE" << EOF

## Autopilot

- **Mode:** $mode
- **Started:** $(iso_timestamp)
- **Current Phase:** $phase
- **Phases Remaining:** $remaining
- **Checkpoints Pending:** (none)
- **Last Error:** $error
- **Updated:** $(iso_timestamp)
EOF
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Cost Tracking
# ─────────────────────────────────────────────────────────────────────────────

TOTAL_TOKENS=0
TOTAL_COST_CENTS=0

track_cost() {
  local log_file="$1"
  local phase="$2"

  local tokens=0

  # First try: read from display state (populated by stream processor)
  if [ -f "$DISPLAY_STATE_DIR/tokens" ]; then
    tokens=$(cat "$DISPLAY_STATE_DIR/tokens" 2>/dev/null || echo "0")
  fi

  # Fallback: parse from JSON log file
  if [ "$tokens" -eq 0 ] && [ -f "$log_file" ]; then
    # Extract usage from message_stop or message_delta events
    local input=$(grep -o '"input_tokens":[0-9]*' "$log_file" 2>/dev/null | tail -1 | grep -o '[0-9]*' || echo "0")
    local output=$(grep -o '"output_tokens":[0-9]*' "$log_file" 2>/dev/null | tail -1 | grep -o '[0-9]*' || echo "0")
    tokens=$((${input:-0} + ${output:-0}))
  fi

  if [ "$tokens" -gt 0 ]; then
    TOTAL_TOKENS=$((TOTAL_TOKENS + tokens))

    # Estimate cost (adjust rates as needed)
    # Sonnet: ~$3/1M input, ~$15/1M output (approximating with $9/1M average)
    local cost_cents=$((tokens * 9 / 10000))
    TOTAL_COST_CENTS=$((TOTAL_COST_CENTS + cost_cents))

    local total_dollars=$((TOTAL_COST_CENTS / 100))
    local total_remainder=$((TOTAL_COST_CENTS % 100))
    local total_cost=$(printf "%d.%02d" $total_dollars $total_remainder)

    log "COST" "Phase $phase: ${tokens} tokens (~\$${total_cost} total)"
  else
    log "WARN" "Could not extract token count for phase $phase"
  fi

  # Clear tokens file for next phase
  rm -f "$DISPLAY_STATE_DIR/tokens" 2>/dev/null

  # Budget check
  if [ "$BUDGET_LIMIT" -gt 0 ]; then
    local budget_cents=$((BUDGET_LIMIT * 100))
    if [ "$TOTAL_COST_CENTS" -gt "$budget_cents" ]; then
      local total_dollars=$((TOTAL_COST_CENTS / 100))
      local total_remainder=$((TOTAL_COST_CENTS % 100))
      local total_cost=$(printf "%d.%02d" $total_dollars $total_remainder)
      notify "Budget exceeded: \$${total_cost} / \$${BUDGET_LIMIT}" "error"
      update_autopilot_state "paused" "$phase" "${PHASES[*]}" "budget_exceeded"
      exit 0
    fi

    local warning_threshold=$((budget_cents * 80 / 100))
    if [ "$TOTAL_COST_CENTS" -gt "$warning_threshold" ]; then
      notify "Budget warning: 80% used" "warning"
    fi
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Checkpoint Handling
# ─────────────────────────────────────────────────────────────────────────────

queue_checkpoint() {
  local phase="$1"
  local plan="$2"
  local checkpoint_data="$3"

  local checkpoint_file="$CHECKPOINT_DIR/pending/phase-${phase}-plan-${plan}.json"
  echo "$checkpoint_data" > "$checkpoint_file"

  log "CHECKPOINT" "Queued: $checkpoint_file"
  notify "Checkpoint queued: Phase $phase, Plan $plan" "checkpoint"
}

process_approved_checkpoints() {
  mkdir -p "$CHECKPOINT_DIR/processed"

  for approval in "$CHECKPOINT_DIR/approved/"*.json; do
    [ -f "$approval" ] || continue

    if grep -q '"approved": false' "$approval" 2>/dev/null; then
      log "INFO" "Checkpoint rejected, skipping: $approval"
      mv "$approval" "$CHECKPOINT_DIR/processed/"
      continue
    fi

    local basename=$(basename "$approval" .json)
    local phase=$(echo "$basename" | sed -n 's/phase-\([0-9]*\)-.*/\1/p')
    local plan=$(echo "$basename" | sed -n 's/.*plan-\([0-9]*\)/\1/p')

    if [ -z "$phase" ] || [ -z "$plan" ]; then
      log "WARN" "Could not parse phase/plan from: $approval"
      mv "$approval" "$CHECKPOINT_DIR/processed/"
      continue
    fi

    log "INFO" "Processing approved checkpoint: Phase $phase, Plan $plan"

    local user_response=$(grep -o '"response"[[:space:]]*:[[:space:]]*"[^"]*"' "$approval" | sed 's/.*: *"//' | sed 's/"$//' || echo "")
    local continuation_log="$LOG_DIR/continuation-phase${phase}-plan${plan}-$(date +%Y%m%d-%H%M%S).log"

    add_activity "commit" "continuing from checkpoint"

    # Continue phase execution after checkpoint approval
    local checkpoint_prompt="$LOG_DIR/checkpoint-phase${phase}.prompt.md"
    generate_prompt "execute-phase-prompt.md" "$checkpoint_prompt" "$phase"
    run_claude_with_prompt "$checkpoint_prompt" "$continuation_log"

    if [ $? -ne 0 ]; then
      log "ERROR" "Continuation failed"
    else
      mv "$approval" "$CHECKPOINT_DIR/processed/"
      track_cost "$continuation_log" "$phase"
    fi
  done
}

# ─────────────────────────────────────────────────────────────────────────────
# Phase Execution
# ─────────────────────────────────────────────────────────────────────────────

is_phase_complete() {
  local phase="$1"
  local padded=$(printf "%02d" "$phase" 2>/dev/null || echo "$phase")
  local phase_dir=$(ls -d .planning/phases/${padded}-* 2>/dev/null | head -1)

  # Phase is complete if VERIFICATION.md exists with status: passed OR "PHASE COMPLETE"
  if [ -n "$phase_dir" ]; then
    local verif_file=$(ls "$phase_dir"/*-VERIFICATION.md 2>/dev/null | head -1)
    if [ -f "$verif_file" ]; then
      # Check both formats: "status: passed" and "PHASE COMPLETE"
      if grep -qE "^status:[[:space:]]*passed" "$verif_file" 2>/dev/null; then
        return 0
      fi
      if grep -q "PHASE COMPLETE" "$verif_file" 2>/dev/null; then
        return 0
      fi
    fi
  fi
  return 1
}

execute_phase() {
  local phase="$1"
  local phase_idx="$2"
  local total_phases="$3"
  local attempt=1

  # Mark that we're executing (for signal handling)
  EXECUTING=1

  # Safety check before starting
  ensure_clean_working_tree "before phase $phase"

  # Skip completed phases
  if is_phase_complete "$phase"; then
    log "INFO" "Phase $phase already complete, skipping"
    return 0
  fi

  # Load phase context
  CURRENT_PHASE="$phase"
  load_phase_context "$phase"
  reset_stages

  # Start activity reader and display
  start_activity_reader "$total_phases" "$phase_idx"

  # Initial render (hide cursor for clean display)
  if [ -t 1 ]; then
    printf "${CURSOR_HIDE}${CURSOR_HOME}${CURSOR_CLEAR}"
    render_display "$total_phases" "$phase_idx"
  fi

  while [ $attempt -le $MAX_RETRIES ]; do
    # Create fresh log file for each attempt
    local phase_log="$LOG_DIR/phase-${phase}-attempt${attempt}-$(date +%Y%m%d-%H%M%S).log"

    if [ $attempt -gt 1 ]; then
      log "INFO" "Retry $attempt/$MAX_RETRIES for phase $phase"
      add_activity "retry" "attempt $attempt of $MAX_RETRIES"

      # Wait a bit before retry to avoid rate limiting
      log "INFO" "Waiting 5 seconds before retry..."
      sleep 5
    fi

    # Check if phase needs planning
    local phase_dir=$(ls -d .planning/phases/$(printf "%02d" "$phase" 2>/dev/null || echo "$phase")-* 2>/dev/null | head -1)

    if [ -z "$phase_dir" ] || [ $(ls "$phase_dir"/*-PLAN.md 2>/dev/null | wc -l) -eq 0 ]; then
      log "INFO" "Planning phase $phase"

      local plan_prompt="$LOG_DIR/plan-phase-${phase}.prompt.md"
      generate_prompt "plan-phase-prompt.md" "$plan_prompt" "$phase"
      run_claude_with_prompt "$plan_prompt" "$phase_log"

      if [ $? -ne 0 ]; then
        log "ERROR" "Planning failed for phase $phase"
        ((attempt++))
        sleep 5
        continue
      fi

      phase_dir=$(ls -d .planning/phases/$(printf "%02d" "$phase" 2>/dev/null || echo "$phase")-* 2>/dev/null | head -1)
    fi

    # Execution
    log "INFO" "Executing phase $phase"

    local exec_prompt="$LOG_DIR/execute-phase-${phase}.prompt.md"
    generate_prompt "execute-phase-prompt.md" "$exec_prompt" "$phase"
    run_claude_with_prompt "$exec_prompt" "$phase_log"

    if [ $? -ne 0 ]; then
      log "ERROR" "Execution failed for phase $phase"
      ((attempt++))
      sleep 5
      continue
    fi

    track_cost "$phase_log" "$phase"

    # Check verification status
    local verification_file=$(ls "$phase_dir"/*-VERIFICATION.md 2>/dev/null | head -1)
    local status="incomplete"  # Default to incomplete, NOT passed

    # First check: did Claude produce any output?
    local log_size=$(wc -c < "$phase_log" 2>/dev/null | tr -d ' ')
    if [ "$log_size" -eq 0 ]; then
      log "WARN" "Phase $phase: Claude produced no output (log file empty)"
      status="incomplete"
    elif [ -f "$verification_file" ]; then
      # Check for explicit status line first
      if grep -qE "^status:" "$verification_file" 2>/dev/null; then
        status=$(grep "^status:" "$verification_file" | head -1 | cut -d: -f2 | tr -d ' ')
      elif grep -q "PHASE COMPLETE" "$verification_file" 2>/dev/null; then
        status="passed"
      elif grep -q "GAPS FOUND" "$verification_file" 2>/dev/null; then
        status="gaps_found"
      fi
    else
      # No verification file - check if any work was done
      local summary_count=$(ls "$phase_dir"/*-SUMMARY.md 2>/dev/null | wc -l | tr -d ' ')
      if [ "$summary_count" -gt 0 ]; then
        log "INFO" "Phase $phase: Work done but no verification yet"
        status="needs_verification"
      else
        log "WARN" "Phase $phase: No VERIFICATION.md and no SUMMARY.md found"
        status="incomplete"
      fi
    fi

    log "INFO" "Phase $phase status: $status"

    case "$status" in
      "passed")
        complete_current_stage
        EXECUTING=0
        stop_activity_reader
        ensure_clean_working_tree "after phase $phase"
        notify "Phase $phase complete" "success"
        return 0
        ;;

      "gaps_found")
        log "INFO" "Gaps found in phase $phase, planning closure"

        # Generate gap planning prompt (appends gaps mode instruction)
        local gap_plan_prompt="$LOG_DIR/plan-phase-${phase}-gaps.prompt.md"
        generate_prompt "plan-phase-prompt.md" "$gap_plan_prompt" "$phase"
        echo "" >> "$gap_plan_prompt"
        echo "## GAP CLOSURE MODE" >> "$gap_plan_prompt"
        echo "" >> "$gap_plan_prompt"
        echo "This is a gap closure run. Read the VERIFICATION.md file to find gaps:" >> "$gap_plan_prompt"
        echo "- ${phase_dir}/*-VERIFICATION.md" >> "$gap_plan_prompt"
        echo "" >> "$gap_plan_prompt"
        echo "Create plans ONLY to close the identified gaps, not to re-implement existing work." >> "$gap_plan_prompt"
        run_claude_with_prompt "$gap_plan_prompt" "$phase_log"

        if [ $? -ne 0 ]; then
          ((attempt++))
          continue
        fi

        # Generate gap execution prompt
        local gap_exec_prompt="$LOG_DIR/execute-phase-${phase}-gaps.prompt.md"
        generate_prompt "execute-phase-prompt.md" "$gap_exec_prompt" "$phase"
        echo "" >> "$gap_exec_prompt"
        echo "## GAP CLOSURE MODE" >> "$gap_exec_prompt"
        echo "" >> "$gap_exec_prompt"
        echo "Execute ONLY the gap closure plans, not all plans in the phase." >> "$gap_exec_prompt"
        echo "Look for plans created after the initial execution (gap closure plans)." >> "$gap_exec_prompt"
        run_claude_with_prompt "$gap_exec_prompt" "$phase_log"

        if [ $? -ne 0 ]; then
          ((attempt++))
          continue
        fi

        track_cost "$phase_log" "$phase"

        status=$(grep "^status:" "$verification_file" 2>/dev/null | tail -1 | cut -d: -f2 | tr -d ' ')

        if [ "$status" = "passed" ]; then
          complete_current_stage
          EXECUTING=0
          stop_activity_reader
          ensure_clean_working_tree "after phase $phase gap closure"
          notify "Phase $phase complete (after gap closure)" "success"
          return 0
        else
          ((attempt++))
          continue
        fi
        ;;

      "human_needed")
        if [ "$CHECKPOINT_MODE" = "queue" ]; then
          queue_checkpoint "$phase" "verification" "{\"type\": \"human_verification\", \"phase\": \"$phase\"}"
        fi
        complete_current_stage
        EXECUTING=0
        stop_activity_reader
        ensure_clean_working_tree "after phase $phase (human verification queued)"
        return 0
        ;;

      "needs_verification")
        # Work was done but verification not run - trigger verification
        log "INFO" "Running verification for phase $phase"
        # Continue to next attempt which will re-run execution (which includes verification)
        ((attempt++))
        continue
        ;;

      "incomplete"|*)
        # Phase not complete - retry
        log "WARN" "Phase $phase incomplete (status: $status), will retry"
        ((attempt++))
        sleep 5
        continue
        ;;
    esac
  done

  # All retries exhausted
  EXECUTING=0
  stop_activity_reader
  ensure_clean_working_tree "after phase $phase failure"
  notify "Phase $phase FAILED after $MAX_RETRIES attempts" "error"
  return 1
}

# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

main() {
  local total_phases=${#PHASES[@]}
  local start_time=$(date +%s)

  # Startup banner
  clear 2>/dev/null || true

  printf "\n"
  printf "${C_BOLD}${C_CYAN}"
  printf "  ██╗   ██╗ ██████╗\n"
  printf "  ██║   ██║██╔════╝\n"
  printf "  ██║   ██║██║     \n"
  printf "  ██║   ██║██║     \n"
  printf "  ╚██████╔╝╚██████╗\n"
  printf "   ╚═════╝  ╚═════╝\n"
  printf "${C_RESET}\n"
  printf "${C_BOLD}${C_WHITE}  AUTOPILOT${C_RESET}\n"
  printf "${C_DIM}  %s${C_RESET}\n" "$PROJECT_NAME"
  printf "\n"
  printf "${C_DIM}  Phases:      %s${C_RESET}\n" "${PHASES[*]}"
  printf "${C_DIM}  Retries:     %s per phase${C_RESET}\n" "$MAX_RETRIES"
  printf "${C_DIM}  Budget:      \$%s${C_RESET}\n" "$BUDGET_LIMIT"
  printf "${C_DIM}  Checkpoints: %s${C_RESET}\n" "$CHECKPOINT_MODE"
  printf "${C_DIM}  Profile:     %s${C_RESET}\n" "$MODEL_PROFILE"
  printf "\n"
  printf "${C_DIM}  Starting in 3 seconds...${C_RESET}\n"

  sleep 3

  log "INFO" "Autopilot started for $PROJECT_NAME"
  notify "Autopilot started" "info"

  local remaining_phases=("${PHASES[@]}")
  local phase_idx=0

  for phase in "${PHASES[@]}"; do
    process_approved_checkpoints

    remaining_phases=("${remaining_phases[@]:1}")
    local remaining_str="${remaining_phases[*]:-none}"

    update_autopilot_state "running" "$phase" "$remaining_str"

    if ! execute_phase "$phase" "$phase_idx" "$total_phases"; then
      update_autopilot_state "failed" "$phase" "$remaining_str" "phase_${phase}_failed"

      if [ -t 1 ]; then
        printf "${CURSOR_SHOW}"
        printf "\n${C_RED}${C_BOLD}Autopilot stopped at phase $phase${C_RESET}\n"
      fi

      notify "Autopilot STOPPED at phase $phase" "error"
      exit 1
    fi

    ((phase_idx++))
  done

  # Final checkpoint processing
  process_approved_checkpoints

  # Final safety check
  ensure_clean_working_tree "autopilot completion"

  # Completion
  local total_time=$(($(date +%s) - start_time))
  local total_min=$((total_time / 60))
  local total_sec=$((total_time % 60))

  local total_dollars=$((TOTAL_COST_CENTS / 100))
  local total_remainder=$((TOTAL_COST_CENTS % 100))
  local total_cost=$(printf "%d.%02d" $total_dollars $total_remainder)

  update_autopilot_state "completed" "all" "none"

  if [ -t 1 ]; then
    printf "${CURSOR_SHOW}"
    clear

    printf "\n"
    printf "${C_BOLD}${C_GREEN}"
    printf "  ╔═══════════════════════════════════════════════════╗\n"
    printf "  ║              MILESTONE COMPLETE                   ║\n"
    printf "  ╚═══════════════════════════════════════════════════╝\n"
    printf "${C_RESET}\n"

    printf "${C_WHITE}  Phases:${C_RESET}    %d completed\n" "$total_phases"
    printf "${C_WHITE}  Time:${C_RESET}      %dm %ds\n" "$total_min" "$total_sec"
    printf "${C_WHITE}  Tokens:${C_RESET}    %s\n" "$TOTAL_TOKENS"
    printf "${C_WHITE}  Cost:${C_RESET}      \$%s\n" "$total_cost"
    printf "\n"
  fi

  log "SUCCESS" "Milestone complete: $total_phases phases, ${total_min}m ${total_sec}s, \$$total_cost"

  # Complete milestone
  local milestone_prompt="$LOG_DIR/complete-milestone.prompt.md"
  generate_prompt "complete-milestone-prompt.md" "$milestone_prompt" "" ""
  run_claude_with_prompt "$milestone_prompt" "$LOG_DIR/milestone-complete.log"

  notify "Milestone COMPLETE! $total_phases phases, \$$total_cost" "success"

  # Check for pending checkpoints
  local pending_count=$(ls "$CHECKPOINT_DIR/pending/"*.json 2>/dev/null | wc -l | tr -d ' ')
  if [ "$pending_count" -gt 0 ]; then
    printf "\n"
    printf "${C_YELLOW}  Pending checkpoints: %d${C_RESET}\n" "$pending_count"
    printf "${C_DIM}  Run: /esf:checkpoints${C_RESET}\n"
  fi

  printf "\n"
  printf "${C_DIM}  Logs: %s/${C_RESET}\n" "$LOG_DIR"
  printf "\n"
}

# ─────────────────────────────────────────────────────────────────────────────
# Run
# ─────────────────────────────────────────────────────────────────────────────

main "$@"
