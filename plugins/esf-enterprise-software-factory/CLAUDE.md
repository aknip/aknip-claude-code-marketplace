# CLAUDE.md

## The Iron Law

> **NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.**
> Write code before the test? Delete it. Start over.

**Keine Ausnahmen:**
- Nicht als "Referenz" behalten
- Nicht "anpassen" waehrend Tests geschrieben werden
- Nicht darauf schauen
- Loeschen heisst loeschen

**Rationalisierungen ablehnen:**

| Ausrede | Antwort |
|---------|---------|
| "Zu simpel zum Testen" | "Simpler Code bricht. Test dauert 30 Sekunden." |
| "Ich teste danach" | "Tests die sofort bestehen beweisen nichts." |
| "Muss erst explorieren" | "Exploration wegwerfen, dann mit TDD beginnen." |
| "Als Referenz behalten" | "Du wirst es anpassen. Das ist test-after. Loeschen." |
| "TDD verlangsamt mich" | "TDD ist schneller als Debugging." |

## General Rules

- Test new features with agent-browser (skip only if user says "no tests")
- UI language is German (labels, errors, dates: DD.MM.YYYY, currency: EUR) 
- If agent-browser can't find a browser: `node_modules/agent-browser/bin/agent-browser install`
