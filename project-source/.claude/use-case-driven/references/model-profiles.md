# Model Profiles

Model profiles control which Claude model each UC agent uses. This allows balancing quality vs token spend.

## Profile Definitions

| Agent | `quality` | `balanced` | `budget` |
|-------|-----------|------------|----------|
| uc-analyst | opus | sonnet | sonnet |
| uc-modeler | opus | opus | sonnet |
| uc-phase-researcher | opus | sonnet | haiku |
| uc-planner | opus | opus | sonnet |
| uc-executor | opus | sonnet | sonnet |
| uc-verifier | sonnet | sonnet | haiku |
| uc-checker | sonnet | sonnet | haiku |

## Profile Philosophy

**quality** - Maximum reasoning power
- Opus for all analysis and planning agents
- Sonnet for verification
- Use when: quota available, critical architecture work

**balanced** (default) - Smart allocation
- Opus for planning and modeling (where use case design happens)
- Sonnet for execution and analysis (follows specifications)
- Sonnet for verification (needs reasoning, not just pattern matching)
- Use when: normal development, good balance of quality and cost

**budget** - Minimal Opus usage
- Sonnet for anything that writes code or creates use cases
- Haiku for verification
- Use when: conserving quota, high-volume work, less critical phases

## Resolution Logic

Orchestrators resolve model before spawning:

```
1. Read .planning/config.json
2. Get model_profile (default: "balanced")
3. Look up agent in table above
4. Pass model parameter to Task call
```

## Switching Profiles

Runtime: `/uc:set-profile <profile>` (not yet implemented - use config.json)

Per-project default: Set in `.planning/config.json`:
```json
{
  "model_profile": "balanced",
  "agents": {
    "uc-analyst": { "model": "sonnet" },
    "uc-modeler": { "model": "opus" },
    "uc-planner": { "model": "opus" },
    "uc-executor": { "model": "sonnet" },
    "uc-verifier": { "model": "sonnet" },
    "uc-checker": { "model": "sonnet" }
  }
}
```

## Design Rationale

**Why Opus for uc-modeler and uc-planner?**
These agents make architectural decisions: how to decompose use cases, how to structure phases, how to extract subfunctions. This is where model quality has the highest impact.

**Why Sonnet for uc-executor?**
Executors follow explicit Subfunction specifications. The spec already contains the reasoning; execution is implementation.

**Why Sonnet for uc-analyst?**
Analysis follows established patterns (RUP methodology). Sonnet handles this well with good prompting.

**Why Sonnet (not Haiku) for uc-verifier in balanced?**
Verification requires scenario walking - checking if code *delivers* what the use case promised, not just pattern matching. Sonnet handles this well; Haiku may miss subtle gaps.
