---
description: Create include/extend relationships between use cases
argument-hint: "[source-id] [target-id] [include|extend]"
allowed-tools:
  - Read
  - Bash
  - Write
  - Edit
---

<objective>

Create <<include>> or <<extend>> relationships between use cases. Updates both source and target documents and the index.

**Arguments:**
- `source-id` — Source use case ID (e.g., UC-UG-001)
- `target-id` — Target use case ID (e.g., UC-SF-001)
- `relationship` — Either "include" or "extend"

**Relationship Rules:**
- `<<include>>`: User-Goal → Subfunction (mandatory inclusion)
- `<<extend>>`: Any level to same or lower level (optional extension)

</objective>

<process>

## Parse Arguments

```bash
SOURCE_ID="${1:-}"
TARGET_ID="${2:-}"
RELATIONSHIP="${3:-include}"
```

## Validate Use Cases Exist

```bash
SOURCE_FILE=$(find .planning/use-cases -name "${SOURCE_ID}-*.md" | head -1)
TARGET_FILE=$(find .planning/use-cases -name "${TARGET_ID}-*.md" | head -1)

if [ -z "$SOURCE_FILE" ] || [ -z "$TARGET_FILE" ]; then
  echo "ERROR: Use case not found"
  exit 1
fi
```

## Validate Relationship Makes Sense

| Source Level | Target Level | include | extend |
|--------------|--------------|---------|--------|
| Summary | User-Goal | ✓ | ✓ |
| User-Goal | Subfunction | ✓ | ✓ |
| User-Goal | User-Goal | ✗ | ✓ |
| Subfunction | Subfunction | ✗ | ✓ |

Error if relationship doesn't make sense for levels.

## Check for Circular References

Build relationship graph and check for cycles.

## Update Source Document

Add to Includes or Extends section:

```markdown
## Includes (Mandatory Subfunctions)
- <<include>> ${TARGET_ID}: [Target Name] (at step N)
```

or

```markdown
## Extends
- <<extend>> ${TARGET_ID}: [Target Name] (at extension point EP-X)
```

## Update Target Document (for extends)

Add extension point if needed.

## Update Index

Add relationship to Traceability Matrix:

```markdown
| ${SOURCE_ID} | ${TARGET_ID} | <<${RELATIONSHIP}>> |
```

## Commit

```bash
git add .planning/use-cases/
git commit -m "docs: link ${SOURCE_ID} ${RELATIONSHIP} ${TARGET_ID}"
```

## Confirm

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► RELATIONSHIP CREATED ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${SOURCE_ID} <<${RELATIONSHIP}>> ${TARGET_ID}

Updated:
- ${SOURCE_FILE}
- ${TARGET_FILE} (if extend)
- .planning/use-cases/index.md
```

</process>

<success_criteria>

- [ ] Both use cases validated
- [ ] Relationship validated for levels
- [ ] No circular references
- [ ] Source document updated
- [ ] Target document updated (if extend)
- [ ] Index updated with relationship
- [ ] Committed to git

</success_criteria>
