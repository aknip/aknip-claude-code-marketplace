---
description: Unit-TDD-Workflow fuer Funktionen und Utilities (Red-Green-Refactor)
---

## The Iron Law

> **NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.**
> Write code before the test? Delete it. Start over.

## Wann Unit-TDD anwenden?

Unit-TDD ergaenzt die E2E-Tests (Playwright) auf Funktionsebene:

| Code-Typ | Test-Strategie |
|----------|---------------|
| Zustand Store (Zustand) | Unit-Test mit Vitest |
| Validierungsfunktionen | Unit-Test mit Vitest |
| Berechnungs-/Transformationslogik | Unit-Test mit Vitest |
| Utility-Funktionen | Unit-Test mit Vitest |
| Custom Hooks (Logik) | Unit-Test mit Vitest + Testing Library |
| UI-Komponenten (Darstellung) | E2E-Test mit Playwright (bestehend) |
| User Flows / Szenarien | E2E-Test mit Playwright (bestehend) |

**Faustregel:** Hat die Funktion Logik (if/else, Berechnungen, Transformationen)? → Unit-Test.
Ist es reine UI-Darstellung? → E2E-Test reicht.

## Der 5-Phasen-Zyklus

### Phase 1: RED — Einen fehlschlagenden Test schreiben

**Ein Test. Ein Verhalten. Klarer Name.**

```typescript
// Gut: Ein Verhalten, sprechender Name
test('validateTaskTitle rejects empty string with German error', () => {
  const result = validateTaskTitle('');
  expect(result).toEqual({ valid: false, error: 'Titel ist erforderlich' });
});

// Schlecht: Mehrere Verhaltensweisen in einem Test
test('validateTaskTitle works', () => {
  expect(validateTaskTitle('')).toBeFalsy();
  expect(validateTaskTitle('OK')).toBeTruthy();
  expect(validateTaskTitle('x'.repeat(101))).toBeFalsy();
});
```

### Phase 2: VERIFY RED — Sicherstellen dass er richtig fehlschlaegt

```bash
npx vitest run src/stores/__tests__/task-store.test.ts
```

**Pruefen:**
- Test schlaegt fehl weil Feature fehlt (nicht wegen Tippfehler)
- Fehlermeldung passt zum erwarteten Verhalten
- Test besteht sofort? → "Du testest bestehendes Verhalten. Test anpassen."
- Test hat Fehler (Error statt Failure)? → "Fehler beheben, erneut laufen lassen."

### Phase 3: GREEN — Einfachsten Code schreiben der besteht

**Nur das Minimum. Nicht mehr.**

```typescript
// Gut: Minimal, nur was der Test verlangt
function validateTaskTitle(title: string): ValidationResult {
  if (!title.trim()) {
    return { valid: false, error: 'Titel ist erforderlich' };
  }
  return { valid: true };
}

// Schlecht: Mehr als der Test verlangt (YAGNI)
function validateTaskTitle(title: string): ValidationResult {
  if (!title.trim()) return { valid: false, error: 'Titel ist erforderlich' };
  if (title.length > 100) return { valid: false, error: 'Zu lang' }; // ← kein Test dafuer!
  if (title.includes('<')) return { valid: false, error: 'HTML' }; // ← kein Test dafuer!
  return { valid: true };
}
```

### Phase 4: VERIFY GREEN — Alle Tests gruen

```bash
npx vitest run src/stores/__tests__/task-store.test.ts
```

**Pruefen:**
- Neuer Test besteht
- Alle bisherigen Tests bestehen noch
- Keine Warnungen, kein unerwarteter Output
- Test schlaegt fehl? → "Code fixen, nicht den Test."

### Phase 5: REFACTOR — Aufraeumen, Tests gruen halten

- Duplikate entfernen
- Namen verbessern
- Helpers extrahieren
- **Kein neues Verhalten hinzufuegen**
- Tests nach jedem Refactoring-Schritt laufen lassen

## Verifikations-Checkliste

Vor Commit muessen alle Punkte erfuellt sein:

- [ ] Jede neue Funktion/Methode hat einen Unit-Test
- [ ] Jeden Test scheitern sehen bevor implementiert
- [ ] Jeder Test scheiterte aus dem erwarteten Grund
- [ ] Minimalen Code geschrieben um jeden Test zu bestehen
- [ ] Alle Tests gruen
- [ ] Output sauber (keine Fehler, Warnungen)
- [ ] Tests verwenden echten Code (Mocks nur wenn unvermeidbar)
- [ ] Edge Cases und Fehler abgedeckt

**Nicht alle Punkte erfuellt? TDD uebersprungen. Von vorne anfangen.**

## Red Flags — Code loeschen und neu beginnen

| Situation | Aktion |
|-----------|--------|
| Kann nicht erklaeren warum Test fehlschlaegt | Code loeschen, mit TDD neu beginnen |
| Tests nach Code geschrieben | Code loeschen, Test zuerst |
| "Kurz ausprobiert" und dann Tests ergaenzt | Exploration-Code loeschen, TDD |
| Mehr als 3 Fix-Versuche am Test | Ansatz ueberdenken, neu beginnen |

## Integration mit ESF-Workflow

Unit-Tests werden **innerhalb** des bestehenden TDD-Loops ausgefuehrt:

```
1. E2E-Test-Skelett laden (bestehend)
2. Unit-Tests fuer Logik schreiben (NEU — Iron Law)
3. Unit-Tests ausfuehren → RED
4. Implementieren → Unit-Tests GREEN
5. E2E-Test ausfuehren → RED → GREEN (bestehend)
6. Commit mit Unit-Tests + E2E-Tests + Code
```

## Testdatei-Konvention

```
src/
├── stores/
│   ├── task-store.ts
│   └── __tests__/
│       └── task-store.test.ts
├── lib/
│   ├── utils.ts
│   └── __tests__/
│       └── utils.test.ts
├── features/portal1/tasks/
│   ├── schema.ts
│   └── __tests__/
│       └── schema.test.ts
```

**Namenskonvention:** `{modul}.test.ts` im `__tests__/`-Unterverzeichnis.

## Framework

- **Vitest** als Test-Runner (bereits Vite-kompatibel)
- **@testing-library/react** fuer Hook-Tests (optional)
- Kein Jest (Vite-Projekt → Vitest)

## Vitest Setup (einmalig)

Falls `vitest` noch nicht installiert:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

`vitest.config.ts` (falls nicht vorhanden):
```typescript
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```
