<ui_patterns>

Visual patterns for user-facing UC output. Commands @-reference this file.

## Stage Banners

Use for major workflow transitions.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► {STAGE NAME}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Stage names (uppercase):**
- `QUESTIONING`
- `ANALYZING USE CASES`
- `CREATING ROADMAP`
- `PLANNING SPRINT {N}`
- `EXECUTING SUB-SPRINT {N}`
- `VERIFYING SCENARIOS`
- `SPRINT {N} COMPLETE ✓`
- `USE CASES EXTRACTED ✓`
- `PROJECT INITIALIZED ✓`

---

## Checkpoint Boxes

User action required. 62-character width.

```
╔══════════════════════════════════════════════════════════════╗
║  CHECKPOINT: {Type}                                          ║
╚══════════════════════════════════════════════════════════════╝

{Content}

──────────────────────────────────────────────────────────────
→ {ACTION PROMPT}
──────────────────────────────────────────────────────────────
```

**Types:**
- `CHECKPOINT: Verification Required` → `→ Type "approved" or describe issues`
- `CHECKPOINT: Decision Required` → `→ Select: option-a / option-b`
- `CHECKPOINT: Action Required` → `→ Type "done" when complete`

---

## Status Symbols

```
✓  Complete / Passed / Verified
✗  Failed / Missing / Blocked
◆  In Progress
○  Pending
⚡ Auto-approved
⚠  Warning
```

---

## Progress Display

**Sprint/milestone level:**
```
Progress: ████████░░ 80%
```

**Use Case level:**
```
Use Cases: 4/6 verified
```

**Task level:**
```
Tasks: 8/12 implemented
```

---

## Spawning Indicators

```
◆ Spawning uc-analyst...

◆ Spawning agents in parallel...
  → uc-executor (plan 01)
  → uc-executor (plan 02)

✓ uc-analyst complete: 3 Summary, 8 Epic use cases extracted
```

---

## Use Case Hierarchy Display

```
## Use Case Hierarchy

**UC-OBJ-001: [Summary Name]**
├── UC-EP-001: [Epic] [Must]
├── UC-EP-002: [Epic] [Should]
└── UC-EP-003: [Epic] [Could]

**UC-OBJ-002: [Summary Name]**
├── UC-EP-004: [Epic] [Must]
└── UC-EP-005: [Epic] [Should]
```

---

## Next Up Block

Always at end of major completions.

```
───────────────────────────────────────────────────────────────

## ▶ Next Up

**{Identifier}: {Name}** — {one-line description}

`{copy-paste command}`

<sub>`/clear` first → fresh context window</sub>

───────────────────────────────────────────────────────────────

**Also available:**
- `/esf:alternative-1` — description
- `/esf:alternative-2` — description

───────────────────────────────────────────────────────────────
```

---

## Error Box

```
╔══════════════════════════════════════════════════════════════╗
║  ERROR                                                       ║
╚══════════════════════════════════════════════════════════════╝

{Error description}

**To fix:** {Resolution steps}
```

---

## Tables

```
| Use Case | Status | Scenarios | Verified |
|----------|--------|-----------|----------|
| UC-EP-001 | ✓ | 4/4 | Yes |
| UC-EP-002 | ◆ | 2/3 | No |
| UC-EP-003 | ○ | 0/2 | No |
```

---

## Anti-Patterns

- Varying box/banner widths
- Mixing banner styles (`===`, `---`, `***`)
- Skipping `UC ►` prefix in banners
- Random emoji (`🚀`, `✨`, `💫`)
- Missing Next Up block after completions

</ui_patterns>
