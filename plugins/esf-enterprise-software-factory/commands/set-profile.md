# Command: /esf:set-profile

## Purpose

Quick command to change the model profile. Faster than using `/esf:settings --edit` when you only want to adjust quality/cost trade-off.

## When to Use

- Switching between quality and cost modes
- Starting production-critical project (use `quality`)
- Prototyping or learning (use `budget`)
- Most projects (use `balanced`)

## Prerequisites

None - can run anytime

## Usage

```bash
/esf:set-profile [quality|balanced|budget]
```

### Arguments

- Profile name: `quality`, `balanced`, or `budget` (required)

## Model Profiles Explained

### quality - Best Quality, Highest Cost

**Use Case:** Production-critical projects, complex domains, high stakes

**Agent Assignments:**
- **Opus:** uc-analyst, uc-modeler, uc-planner, uc-verifier, uc-checker, uc-phase-researcher
- **Sonnet:** uc-executor, uc-brownfield-mapper

**Benefits:**
- Highest quality analysis and planning
- Better pattern detection and recommendations
- More thorough verification
- Fewer misunderstandings

**Cost:** ~3x baseline (mostly Opus usage)

---

### balanced - Good Balance ⚖️

**Use Case:** Most projects, good quality at reasonable cost (DEFAULT)

**Agent Assignments:**
- **Opus:** uc-modeler, uc-planner
- **Sonnet:** uc-analyst, uc-executor, uc-verifier, uc-checker, uc-phase-researcher, uc-brownfield-mapper

**Benefits:**
- Good quality for planning (Opus)
- Cost-effective for execution (Sonnet)
- Best default for most projects

**Cost:** ~1.5x baseline

---

### budget - Cost Optimized

**Use Case:** Prototyping, learning, experimentation, non-critical projects

**Agent Assignments:**
- **Sonnet:** All agents

**Benefits:**
- Lowest cost
- Still high quality (Sonnet is excellent)
- Fast response times

**Cost:** ~1x baseline (Sonnet only)

**Trade-offs:**
- Planning may be less nuanced
- Verification may catch fewer edge cases
- Pattern detection may miss subtleties

## Output Example (No Arguments)

```bash
/esf:set-profile
```

```
⚙️  Model Profile Settings

Current Profile: balanced ⚖️

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AVAILABLE PROFILES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  quality - Best Quality, Highest Cost
   • Use Opus for: analysis, planning, verification, research
   • Use Sonnet for: execution
   • Best for: Critical projects, complex domains
   • Cost: ~3x baseline

   Agent Assignments (if selected):
      uc-analyst           → Opus
      uc-modeler           → Opus
      uc-planner           → Opus
      uc-executor          → Sonnet
      uc-verifier          → Opus
      uc-checker           → Opus
      uc-phase-researcher  → Opus
      uc-brownfield-mapper → Sonnet

2️⃣  balanced - Good Balance ⭐ CURRENT
   • Use Opus for: planning
   • Use Sonnet for: analysis, execution, verification, research
   • Best for: Most projects
   • Cost: ~1.5x baseline

   Agent Assignments (current):
      uc-analyst           → Sonnet
      uc-modeler           → Opus
      uc-planner           → Opus
      uc-executor          → Sonnet
      uc-verifier          → Sonnet
      uc-checker           → Sonnet
      uc-phase-researcher  → Sonnet
      uc-brownfield-mapper → Sonnet

3️⃣  budget - Cost Optimized
   • Use Sonnet for: everything
   • Best for: Prototypes, learning, experimentation
   • Cost: ~1x baseline

   Agent Assignments (if selected):
      [All agents] → Sonnet

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Select profile [1-3] or profile name: 1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROFILE CHANGE: balanced → quality
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Agent assignments will change:

   uc-analyst:           Sonnet → Opus    [upgraded]
   uc-modeler:           Opus   → Opus    [no change]
   uc-planner:           Opus   → Opus    [no change]
   uc-executor:          Sonnet → Sonnet  [no change]
   uc-verifier:          Sonnet → Opus    [upgraded]
   uc-checker:           Sonnet → Opus    [upgraded]
   uc-phase-researcher:  Sonnet → Opus    [upgraded]
   uc-brownfield-mapper: Sonnet → Sonnet  [no change]

Impact:
   ✅ Higher quality analysis and pattern detection
   ✅ Better verification and checking
   ✅ More thorough research
   ⚠️  ~2x increase in API costs

⚠️  Note: Quality profile increases costs significantly.
         Recommended for production-critical projects.

Save changes? (y/n): y

✅ Profile updated to: quality
✅ Settings saved to .planning/config.json

Changes will apply to next agent execution.
```

## Output Example (With Argument)

```bash
/esf:set-profile budget
```

```
⚙️  Changing Model Profile

Current: balanced
New: budget

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROFILE: budget - Cost Optimized
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Agent Assignments (all → Sonnet):
   uc-analyst           → Sonnet (was Sonnet)
   uc-modeler           → Sonnet (was Opus)    [downgraded]
   uc-planner           → Sonnet (was Opus)    [downgraded]
   uc-executor          → Sonnet (was Sonnet)
   uc-verifier          → Sonnet (was Sonnet)
   uc-checker           → Sonnet (was Sonnet)
   uc-phase-researcher  → Sonnet (was Sonnet)
   uc-brownfield-mapper → Sonnet (was Sonnet)

Impact:
   ✅ Lower API costs (~30% reduction)
   ✅ Faster response times
   ⚠️  Planning may be less nuanced (Opus → Sonnet)
   ⚠️  Roadmap creation less detailed (Opus → Sonnet)

Best for: Prototyping, learning, non-critical projects

Confirm? (y/n): y

✅ Profile updated to: budget
✅ Settings saved

Cost savings: ~30% for typical project
```

## Switching from budget to quality

```bash
/esf:set-profile quality
```

```
⚙️  Profile Change: budget → quality

⚠️  Large Quality Increase

You're upgrading from budget (all Sonnet) to quality (mostly Opus).

Cost impact:
   Current: ~$X per phase (estimate)
   New: ~$3X per phase (estimate)
   Increase: ~3x total cost

Quality improvements:
   ✅ Much better planning and roadmap creation
   ✅ Better pattern detection and recommendations
   ✅ More thorough verification
   ✅ Fewer overlooked edge cases

Recommended for:
   ✅ Production-critical projects
   ✅ Complex business domains
   ✅ High-stakes applications
   ❌ Not for prototyping or learning

Continue with upgrade? (y/n):
```

## Invalid Profile

```bash
/esf:set-profile premium
```

```
❌ Invalid Profile

Profile "premium" is not recognized.

Valid profiles:
   • quality  - Best quality, highest cost (~3x)
   • balanced - Good balance, default (~1.5x)
   • budget   - Cost optimized (~1x)

Usage:
   /esf:set-profile [quality|balanced|budget]

To see detailed comparison:
   /esf:set-profile
```

## No Changes

```bash
/esf:set-profile balanced
```

```
ℹ️  Profile Already Set

Current profile: balanced
Requested profile: balanced

No changes needed.

Current agent assignments:
   uc-analyst           → Sonnet
   uc-modeler           → Opus
   uc-planner           → Opus
   uc-executor          → Sonnet
   uc-verifier          → Sonnet
   uc-checker           → Sonnet
   uc-phase-researcher  → Sonnet
   uc-brownfield-mapper → Sonnet

To view all settings:
   /esf:settings
```

## Comparison Display

```bash
/esf:set-profile --compare
```

```
⚙️  Model Profile Comparison

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROFILE COMPARISON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Agent              │ Quality    │ Balanced  │ Budget
───────────────────┼────────────┼───────────┼────────
uc-analyst         │ Opus       │ Sonnet    │ Sonnet
uc-modeler         │ Opus       │ Opus      │ Sonnet
uc-planner         │ Opus       │ Opus      │ Sonnet
uc-executor        │ Sonnet     │ Sonnet    │ Sonnet
uc-verifier        │ Opus       │ Sonnet    │ Sonnet
uc-checker         │ Opus       │ Sonnet    │ Sonnet
uc-phase-researcher│ Opus       │ Sonnet    │ Sonnet
uc-brownfield-...  │ Sonnet     │ Sonnet    │ Sonnet

Cost Factor        │ ~3x        │ ~1.5x     │ ~1x
Best For           │ Production │ Default   │ Prototyping
Planning Quality   │ ⭐⭐⭐⭐⭐   │ ⭐⭐⭐⭐    │ ⭐⭐⭐
Execution Quality  │ ⭐⭐⭐⭐    │ ⭐⭐⭐⭐    │ ⭐⭐⭐⭐
Verification       │ ⭐⭐⭐⭐⭐   │ ⭐⭐⭐⭐    │ ⭐⭐⭐

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current Profile: balanced ⚖️

To change:
   /esf:set-profile [quality|balanced|budget]
```

## Mid-Project Warning

If changing profile during active project:

```
⚠️  Mid-Project Profile Change

Current phase in progress: 02-user-authentication

Changing profile will affect:
   ✅ Future agent executions
   ❌ Already-executed work (unchanged)

This can cause inconsistency in planning/execution style.

Recommendations:
   1. Complete current phase before changing
   2. Document profile change in STATE.md
   3. Continue with new profile

Continue anyway? (y/n):
```

## Related Commands

- `/esf:settings` - Full settings management
- `/esf:settings --edit --category model` - Edit model settings with more options
- `/esf:progress` - View current progress

## Configuration File

Updates `.planning/config.json`:

```json
{
  "model_profile": "quality",
  "agents": {
    "uc-analyst": { "model": "opus" },
    "uc-modeler": { "model": "opus" },
    "uc-planner": { "model": "opus" },
    "uc-executor": { "model": "sonnet" },
    "uc-verifier": { "model": "opus" },
    "uc-checker": { "model": "opus" },
    "uc-phase-researcher": { "model": "opus" },
    "uc-brownfield-mapper": { "model": "sonnet" }
  }
}
```

## Profile Selection Guide

**Choose `quality` if:**
- Production/critical application
- Complex business domain
- High user count / high stakes
- Budget allows premium models
- Quality is priority over cost

**Choose `balanced` if:**
- Most projects (default)
- Good quality needed but cost-conscious
- Standard business application
- Team/startup with limited budget

**Choose `budget` if:**
- Learning/experimenting with framework
- Prototyping
- Non-critical application
- Very cost-sensitive
- High volume of API calls expected

## Implementation Details

This command should:

1. **Parse argument** - Get profile name or prompt if missing
2. **Validate profile** - Must be quality/balanced/budget
3. **Load current settings** - Read .planning/config.json
4. **Show comparison** - Display current vs new assignments
5. **Calculate impact** - Show cost and quality changes
6. **Confirm change** - Require user confirmation (unless --force)
7. **Update config** - Write new profile and agent assignments
8. **Display summary** - Confirm changes saved

The implementation should:
- **Be fast** - Single-purpose command, complete quickly
- **Be informative** - Clearly explain impact of change
- **Be safe** - Confirm before making changes (unless --force)
- **Update atomically** - Don't corrupt config if save fails
