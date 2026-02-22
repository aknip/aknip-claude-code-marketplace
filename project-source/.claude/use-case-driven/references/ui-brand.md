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
- `PLANNING PHASE {N}`
- `EXECUTING WAVE {N}`
- `VERIFYING SCENARIOS`
- `PHASE {N} COMPLETE ✓`
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

**Phase/milestone level:**
```
Progress: ████████░░ 80%
```

**Use Case level:**
```
Use Cases: 4/6 verified
```

**Subfunction level:**
```
Subfunctions: 8/12 implemented
```

---

## Spawning Indicators

```
◆ Spawning uc-analyst...

◆ Spawning agents in parallel...
  → uc-executor (plan 01)
  → uc-executor (plan 02)

✓ uc-analyst complete: 3 Summary, 8 User-Goal use cases extracted
```

---

## Use Case Hierarchy Display

```
## Use Case Hierarchy

**UC-S-001: [Summary Name]**
├── UC-UG-001: [User-Goal] [Must]
├── UC-UG-002: [User-Goal] [Should]
└── UC-UG-003: [User-Goal] [Could]

**UC-S-002: [Summary Name]**
├── UC-UG-004: [User-Goal] [Must]
└── UC-UG-005: [User-Goal] [Should]
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
- `/uc:alternative-1` — description
- `/uc:alternative-2` — description

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
| UC-UG-001 | ✓ | 4/4 | Yes |
| UC-UG-002 | ◆ | 2/3 | No |
| UC-UG-003 | ○ | 0/2 | No |
```

---

## Anti-Patterns

- Varying box/banner widths
- Mixing banner styles (`===`, `---`, `***`)
- Skipping `UC ►` prefix in banners
- Random emoji (`🚀`, `✨`, `💫`)
- Missing Next Up block after completions

</ui_patterns>
