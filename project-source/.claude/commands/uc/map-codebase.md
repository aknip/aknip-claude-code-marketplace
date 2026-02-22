# Command: /uc:map-codebase

## Purpose

Analyze an existing codebase before starting UC-driven development. Creates a comprehensive codebase map documenting architecture, patterns, conventions, and integration points. Essential for brownfield projects.

## When to Use

- **Before** `/uc:new-project` on existing codebase
- Starting UC-driven development on legacy code
- Adding features to existing application
- Team onboarding (understand codebase quickly)
- Before major refactoring

## Prerequisites

- Working directory contains existing code
- Code is accessible (not in restricted directories)

## Usage

```bash
/uc:map-codebase [--output FILE] [--quick] [--detailed]
```

### Flags

- `--output FILE`: Custom output location (default: `.planning/brownfield/CODEBASE-MAP.md`)
- `--quick`: Fast 2-3 minute scan (basic info only)
- `--detailed`: Deep analysis 20+ minutes (comprehensive)
- Default: Standard scan (5-10 minutes)

## What This Command Does

### 1. Spawns uc-brownfield-mapper Agent

Launches specialized agent for codebase analysis.

### 2. Analyzes Project Structure

Discovers:
- Programming language(s)
- Framework(s) and versions
- Build system
- Package manager
- Test framework
- Directory organization

### 3. Extracts Architecture

Maps:
- High-level structure
- Module relationships
- Key components/services
- Design patterns in use
- Extension points

### 4. Documents Conventions

Identifies:
- Code style (indentation, quotes, semicolons)
- Naming conventions
- File organization patterns
- Import/export patterns
- Git commit format

### 5. Plans Integration

Recommends:
- Where new code should live
- How to follow existing patterns
- Testing strategy to match
- Build integration approach

### 6. Generates Codebase Map

Creates comprehensive documentation:
```
.planning/brownfield/CODEBASE-MAP.md
```

### 7. Auto-Loads During Planning

Map is automatically loaded by:
- `uc-planner` during `/uc:plan-phase`
- `uc-executor` during `/uc:execute-phase`
- Ensures consistency with existing code

## Output Example

```bash
/uc:map-codebase
```

```
🗺️  Mapping Existing Codebase

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCANNING PROJECT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Working Directory: /Users/aknipschild/github/gsd-first-test

Detecting project type...
   ✅ Found: package.json
   ✅ Language: TypeScript, JavaScript
   ✅ Framework: React 18, Express 4
   ✅ Build: Vite 5.0
   ✅ Tests: Vitest
   ✅ Package Manager: npm

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LAUNCHING ANALYZER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Spawning: uc-brownfield-mapper agent
Mode: Standard scan (5-10 minutes)

[Agent output follows...]

🔍 Analyzing directory structure...
   Found 247 source files
   Found 42 test files
   Identified 8 major modules

🏗️  Mapping architecture...
   Pattern: Monorepo with Frontend/Backend split
   Frontend: React SPA
   Backend: Express REST API
   Shared: TypeScript types

📋 Discovering conventions...
   File naming: PascalCase components, camelCase utilities
   Code style: 2 spaces, single quotes, semicolons
   Imports: External → Internal → Relative
   Git commits: Conventional format (type(scope): message)

🎯 Identifying integration points...
   New features: src/frontend/features/[name]/
   New endpoints: src/backend/routes/[resource]/
   Shared types: src/shared/types/[domain].ts

💾 Generating codebase map...
   Sections: 12
   Examples: 25 code snippets
   Recommendations: 8

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANALYSIS COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Codebase Mapped Successfully

📊 Summary:
   Language: TypeScript (primary)
   Framework: React + Express
   Architecture: Monorepo with clear separation
   Patterns: Functional components, REST API, Zod validation
   Style: ESLint + Prettier enforced
   Tests: 75% coverage (estimated)

📁 Map Location:
   .planning/brownfield/CODEBASE-MAP.md

📄 Map Contents:
   ✅ Technology stack
   ✅ Architecture diagram
   ✅ Code conventions
   ✅ Common patterns
   ✅ Integration recommendations
   ✅ Extension points
   ✅ Build & test commands

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  Review the codebase map:
   cat .planning/brownfield/CODEBASE-MAP.md

2️⃣  Start UC-driven development:
   /uc:new-project

3️⃣  Plan features:
   /uc:plan-phase [N]

Note: The codebase map will be automatically loaded during planning.
      Execution agents will follow discovered patterns.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Analysis time: 7 minutes 23 seconds
```

## Quick Scan Mode

```bash
/uc:map-codebase --quick
```

```
🗺️  Quick Codebase Scan (2-3 minutes)

Scanning...

✅ Quick Map Generated

Technology Stack:
   - TypeScript + React + Express
   - Vite build, npm package manager
   - Vitest tests

Basic Structure:
   - src/frontend/ (React SPA)
   - src/backend/ (Express API)
   - src/shared/ (types)

Saved to: .planning/brownfield/CODEBASE-MAP.md

Note: Quick scan provides basic info.
      For comprehensive analysis, run: /uc:map-codebase --detailed
```

## Detailed Scan Mode

```bash
/uc:map-codebase --detailed
```

```
🗺️  Detailed Codebase Analysis (20+ minutes)

This will perform exhaustive analysis:
   - All source files
   - All dependencies
   - Git history analysis
   - Performance patterns
   - Security considerations
   - Technical debt identification

Estimated time: 20-30 minutes

Proceed? (y/n): y

[Detailed analysis...]
```

## Custom Output Location

```bash
/uc:map-codebase --output docs/ARCHITECTURE.md
```

Saves map to custom location (still auto-loads during planning).

## Empty / New Project

```bash
/uc:map-codebase
```

```
ℹ️  New Project Detected

No existing code found (or minimal boilerplate).

This appears to be a new project. Codebase mapping is most useful for
existing codebases with established patterns.

Options:
   1. Continue anyway (will document any existing files)
   2. Skip mapping and start fresh: /uc:new-project
   3. Cancel

What would you like to do? [1/2/3]:
```

## Large Codebase Warning

For very large codebases (>1000 files):

```
⚠️  Large Codebase Detected

Found ~2,500 source files.
Standard scan may take 15-20 minutes.

Recommendations:
   1. Use --quick for faster basic scan (3-5 min)
   2. Continue with standard scan (accept longer time)
   3. Focus on specific directory: cd src/feature && /uc:map-codebase

Proceed with standard scan? (y/n):
```

## Multiple Frameworks

If project uses multiple frameworks:

```
🗺️  Multi-Framework Project

Detected:
   - React (frontend)
   - Express (backend)
   - React Native (mobile - separate directory)

Map will document all frameworks and their integration.
Analysis time: ~12 minutes

Continue? (y/n):
```

## No Package Manager

For projects without package.json/etc:

```
⚠️  No Package Manager Detected

Could not find: package.json, pom.xml, Cargo.toml, etc.

This may be:
   - Plain JavaScript/HTML project
   - Language without package manager
   - Non-standard structure

Will analyze file structure only.
Framework and dependency detection limited.

Continue? (y/n):
```

## Map Already Exists

If map exists:

```
ℹ️  Existing Codebase Map Found

Found: .planning/brownfield/CODEBASE-MAP.md
Created: 2026-01-20 (7 days ago)

Options:
   1. Regenerate (overwrite existing map)
   2. Update (merge new findings with existing)
   3. View existing map (don't regenerate)
   4. Cancel

What would you like to do? [1/2/3/4]:
```

## Permissions Issue

If files are not readable:

```
❌ Permission Denied

Cannot read some files in: src/backend/

This may prevent complete analysis.

Options:
   1. Continue with limited analysis
   2. Fix permissions and retry
   3. Run as sudo (not recommended)
   4. Cancel

Recommendation: Fix permissions, then retry.

What would you like to do? [1/2/3/4]:
```

## Usage in Planning

After mapping, the map auto-loads:

```
🗺️  Codebase Map Loaded

Planning agents will follow discovered patterns:
   ✅ File naming: PascalCase components
   ✅ Code style: 2 spaces, single quotes
   ✅ Testing: Colocated with Vitest
   ✅ Integration: src/frontend/features/

Execution will respect existing conventions automatically.
```

## Viewing the Map

```bash
cat .planning/brownfield/CODEBASE-MAP.md
```

or

```bash
/uc:map-codebase --view
```

## Related Commands

- `/uc:new-project` - Start UC-driven development (run after mapping)
- `/uc:plan-phase N` - Planning automatically loads map
- `/uc:execute-phase N` - Execution follows discovered patterns
- `/uc:debug` - Diagnose codebase structure issues

## Files Created

- `.planning/brownfield/` - Directory (if doesn't exist)
- `.planning/brownfield/CODEBASE-MAP.md` - Comprehensive map
- `.planning/brownfield/.metadata.json` - Analysis metadata (optional)

## Files Read

Analyzer reads (sampling):
- Package manifest (package.json, pom.xml, etc.)
- Configuration files (vite.config.*, tsconfig.json, etc.)
- Source files (selective sampling)
- Test files (selective sampling)
- Git history (optional, last 50 commits)
- Documentation files (README, CONTRIBUTING, etc.)

## Implementation Details

This command should:

1. **Detect project type** - Check for package.json, pom.xml, etc.
2. **Determine scan depth** - Quick/standard/detailed based on flag
3. **Spawn uc-brownfield-mapper agent** - Pass scan parameters
4. **Stream agent output** - Show progress to user
5. **Save map** - Write to `.planning/brownfield/CODEBASE-MAP.md`
6. **Validate map** - Ensure all sections present
7. **Display summary** - Key findings and next steps

The implementation should:
- **Handle large codebases** - Use sampling for >1000 files
- **Be informative** - Show progress during analysis
- **Be interruptible** - Allow Ctrl+C to cancel
- **Be resumable** - Save partial progress if interrupted
- **Handle errors gracefully** - Permission errors, missing files, etc.
- **Provide actionable output** - Next steps clear

## Agent Configuration

The uc-brownfield-mapper agent receives:
- `--mode`: quick | standard | detailed
- `--output`: Output file path
- Working directory path

Returns comprehensive codebase map.
