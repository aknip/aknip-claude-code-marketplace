---
description: Display implementation decisions and assumptions from a sprint
---

## Purpose

Display implementation decisions and assumptions from a sprint's CONTEXT file. Helps refresh memory before or during sprint execution, especially useful when returning to work after a break.

## When to Use

- Before starting sprint execution (`/esf:execute-sprint`)
- Returning to sprint after break
- Reviewing decisions made during `/esf:discuss-sprint`
- Handoff to another developer
- Resolving questions during implementation

## Prerequisites

- Sprint has CONTEXT.md file (created by `/esf:discuss-sprint`)
- Sprint has been discussed/planned

## Usage

```bash
/esf:list-sprint-assumptions [N]
```

### Arguments

- `N`: Sprint number (required)

## What This Command Does

### 1. Loads CONTEXT File

Reads `.planning/sprints/NN-name/NN-CONTEXT.md`

### 2. Extracts Assumptions

Parses all decision sections:
- Architecture decisions
- Technology choices
- UI/UX decisions
- Data structure decisions
- API design decisions
- Security decisions
- Performance decisions
- Any custom categories

### 3. Formats Display

Shows decisions grouped by category with clear formatting.

## Output Example

```bash
/esf:list-sprint-assumptions 2
```

```
📋 Sprint 02 Implementation Assumptions

Sprint: 02-user-authentication
Context File: .planning/sprints/02-user-authentication/02-CONTEXT.md
Created: 2026-01-25 (discussion session)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ARCHITECTURE DECISIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Authentication Strategy: JWT (JSON Web Tokens)
   - Access token: 15-minute expiration
   - Refresh token: 7-day expiration
   - Stored in httpOnly cookies (not localStorage)
   - Token rotation on refresh

✅ Password Hashing: bcrypt with 12 rounds
   - Industry standard, well-tested
   - Sufficient security for current threat model
   - Consider Argon2 for future versions

✅ Session Storage: In-memory (Node.js process)
   - For development: simple in-memory store
   - For production: Redis recommended
   - Session expiration: 24 hours

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UI/UX DECISIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Login Form: Single page, email + password
   - No "Remember Me" checkbox (handled via refresh tokens)
   - Show/hide password toggle required
   - Email validation on blur
   - German language labels: "E-Mail", "Passwort", "Anmelden"

✅ Error Messages: German, user-friendly, vague
   - "Ungültige Anmeldedaten" (invalid credentials)
   - Don't reveal whether email or password is wrong (security)
   - Toast notification, not inline errors
   - 5-second auto-dismiss

✅ Loading States
   - Disable submit button during request
   - Show spinner in button
   - Prevent double-submission

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATA STRUCTURE DECISIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ User Table Schema
   Fields:
   - id: UUID (primary key)
   - email: VARCHAR(255), unique, indexed
   - password_hash: VARCHAR(255)
   - email_verified: BOOLEAN (default false)
   - created_at: TIMESTAMP
   - updated_at: TIMESTAMP
   - last_login: TIMESTAMP (nullable)

✅ Token Table Schema (for refresh tokens)
   Fields:
   - id: UUID (primary key)
   - user_id: UUID (foreign key to users)
   - token_hash: VARCHAR(255), indexed
   - expires_at: TIMESTAMP
   - created_at: TIMESTAMP

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API DESIGN DECISIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Endpoints
   - POST /api/auth/register
   - POST /api/auth/login
   - POST /api/auth/logout
   - POST /api/auth/refresh
   - GET /api/auth/me (get current user)

✅ Request/Response Format
   - Content-Type: application/json
   - Errors: { error: string, code: string }
   - Success: { data: object, message?: string }

✅ HTTP Status Codes
   - 200: Success
   - 201: Created (registration)
   - 400: Bad request (validation errors)
   - 401: Unauthorized (invalid credentials, expired token)
   - 409: Conflict (email already exists)
   - 500: Server error

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECURITY DECISIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Password Requirements
   - Minimum 8 characters
   - No complexity requirements (per NIST guidelines)
   - Check against breached password database (optional, future)

✅ Rate Limiting
   - Login endpoint: 5 attempts per 15 minutes per IP
   - Registration: 3 attempts per hour per IP
   - Token refresh: 10 per hour per user

✅ CSRF Protection
   - Not needed (using httpOnly cookies + SameSite=Strict)
   - API is stateless with JWT

✅ Input Validation
   - Email: RFC 5322 compliant
   - Password: Length check only
   - Sanitize all inputs against XSS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TESTING DECISIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Unit Tests
   - Password hashing utility
   - Token generation/validation
   - Input validators

✅ Integration Tests
   - Registration flow
   - Login flow
   - Token refresh flow
   - Logout flow

✅ E2E Tests (agent-browser)
   - User can register
   - User can login
   - User can logout
   - Invalid credentials show error
   - Sessions persist across page refresh

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEFERRED DECISIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏳ OAuth Integration (Google, GitHub)
   Reason: Not required for MVP, add in sprint 5

⏳ Two-Factor Authentication (2FA)
   Reason: Security enhancement for later sprint

⏳ Password Reset Flow
   Reason: Out of scope for sprint 02, plan for sprint 04

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OPEN QUESTIONS (During Discussion)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❓ Should we allow social login? → Deferred to sprint 5
❓ Token expiration times? → Decided: 15 min access, 7 day refresh
❓ Session storage? → Decided: In-memory for now, Redis for production

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Assumptions: 28
Categories: 6
Deferred: 3

View full context:
   cat .planning/sprints/02-user-authentication/02-CONTEXT.md

Ready to execute:
   /esf:execute-sprint 2
```

## No Context File

```bash
/esf:list-sprint-assumptions 3
```

```
ℹ️  No Context File

Sprint: 03-user-profile
Context File: .planning/sprints/03-user-profile/03-CONTEXT.md

File does not exist.

This sprint may not have been discussed yet.

Recommendations:
   1. Discuss sprint first: /esf:discuss-sprint 3
   2. Or plan without discussion: /esf:plan-sprint 3 --skip-discussion

Note: CONTEXT files are created during /esf:discuss-sprint to capture
      implementation decisions before planning.
```

## Empty Context

If CONTEXT.md exists but has no assumptions:

```
📋 Sprint 02 Implementation Assumptions

Sprint: 02-user-authentication
Context File: .planning/sprints/02-user-authentication/02-CONTEXT.md

⚠️  No assumptions documented

This CONTEXT file exists but contains no implementation decisions.

Recommendations:
   1. Add assumptions manually to CONTEXT file
   2. Or re-run discussion: /esf:discuss-sprint 2

Template structure:
   - Architecture Decisions
   - UI/UX Decisions
   - Data Structure Decisions
   - API Design Decisions
   - Security Decisions
   - Testing Decisions
```

## Condensed View

```bash
/esf:list-sprint-assumptions 2 --condensed
```

```
📋 Sprint 02 Assumptions (Condensed)

✅ Auth: JWT (15min access, 7day refresh, httpOnly cookies)
✅ Password: bcrypt 12 rounds
✅ Session: In-memory (dev), Redis (prod)
✅ Login UI: Single page, email+password, German labels
✅ Errors: Vague German messages, toast, 5sec dismiss
✅ User table: UUID id, email unique indexed, password_hash
✅ API: /auth/register, /auth/login, /auth/logout, /auth/refresh
✅ Security: 8 char min password, rate limits, input validation
✅ Tests: Unit, integration, E2E with agent-browser

Deferred: OAuth, 2FA, password reset (later sprints)

Full view: /esf:list-sprint-assumptions 2
```

## Invalid Sprint

```bash
/esf:list-sprint-assumptions 99
```

```
❌ Sprint Not Found

Sprint 99 does not exist.

Current sprints: 01-03

View sprints:
   /esf:progress

List assumptions:
   /esf:list-sprint-assumptions [1-3]
```

## Export to File

```bash
/esf:list-sprint-assumptions 2 --output assumptions.txt
```

```
✅ Assumptions Exported

File: assumptions.txt
Format: Plain text markdown
Sprint: 02-user-authentication

View file: cat assumptions.txt
```

## Multiple Sprints

```bash
/esf:list-sprint-assumptions 2 3
```

Shows assumptions for multiple sprints (useful for checking consistency across related sprints).

## Related Commands

- `/esf:discuss-sprint N` - Create CONTEXT file with assumptions
- `/esf:plan-sprint N` - Planning uses these assumptions
- `/esf:execute-sprint N` - Execution follows these assumptions
- `/esf:progress` - View overall progress

## Files Read

- `.planning/sprints/NN-name/NN-CONTEXT.md` - Context file with assumptions

## Integration with Workflow

Assumptions flow through workflow:

```
/esf:discuss-sprint 2
   ↓ (Creates CONTEXT.md with assumptions)

/esf:list-sprint-assumptions 2
   ↓ (Review assumptions)

/esf:plan-sprint 2
   ↓ (Planner loads assumptions, creates plans)

/esf:execute-sprint 2
   ↓ (Executor follows assumptions)

/esf:verify-sprint 2
   ↓ (Verifier checks assumptions met)
```

## CONTEXT File Structure

`.planning/sprints/02-name/02-CONTEXT.md`:

```markdown
# Sprint 02 Implementation Context

Captured: 2026-01-25
Discussion Session: 45 minutes

---

## Architecture Decisions

### Authentication Strategy
Decision: Use JWT...
Rationale: ...

### Password Storage
Decision: bcrypt...
Rationale: ...

---

## UI/UX Decisions

[... sections ...]

---

## Deferred Decisions

[... items ...]

---

## Open Questions (Resolved)

[... Q&A ...]
```

## Implementation Details

This command should:

1. **Locate CONTEXT file** - `.planning/sprints/NN-name/NN-CONTEXT.md`
2. **Parse structure** - Extract all decision sections
3. **Format output** - Group by category, use clear formatting
4. **Handle variations** - Support different section names/structures
5. **Display metadata** - Created date, sprint info
6. **Provide navigation** - Next steps, related commands

The implementation should:
- **Be fast** - Parse and display in < 1 second
- **Be flexible** - Handle varying CONTEXT file structures
- **Be informative** - Show enough context without overwhelming
- **Support filtering** - Condensed view, specific categories
- **Handle missing files** - Graceful error with helpful suggestions
