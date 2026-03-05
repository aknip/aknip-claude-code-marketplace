# Unit-Test Anti-Patterns

## Die drei eisernen Gesetze

1. **NIEMALS Mock-Verhalten testen**
2. **NIEMALS test-only Methoden in Produktions-Klassen**
3. **NIEMALS mocken ohne Dependencies zu verstehen**

## Anti-Pattern 1: Mock-Verhalten testen

**Schlecht:** Prueft nur ob Mock aufgerufen wurde, nicht ob reales Verhalten stimmt.

```typescript
// FALSCH: Testet den Mock, nicht die Funktion
test('saveTask calls store', () => {
  const mockStore = { addTask: vi.fn() };
  saveTask(mockStore, 'Test');
  expect(mockStore.addTask).toHaveBeenCalled(); // Beweist nur Mock-Setup
});

// RICHTIG: Testet echtes Verhalten
test('saveTask adds task to state', () => {
  const store = createTaskStore();
  saveTask(store, 'Test');
  expect(store.getState().tasks).toHaveLength(1);
  expect(store.getState().tasks[0].title).toBe('Test');
});
```

**Gate-Frage:** Wenn ich den Mock entferne — testet der Test noch etwas Sinnvolles?

## Anti-Pattern 2: Test-Only Methoden in Produktion

**Schlecht:** Methoden die nur Tests aufrufen.

```typescript
// FALSCH: reset() existiert nur fuer Tests
class TaskStore {
  tasks: Task[] = [];
  addTask(t: Task) { this.tasks.push(t); }
  reset() { this.tasks = []; } // ← Nur Tests nutzen das!
}

// RICHTIG: Test-Utilities separat
// test-helpers/store-utils.ts
export function createFreshStore() {
  return createTaskStore(); // Neue Instanz pro Test
}
```

## Anti-Pattern 3: Mocken ohne Dependencies zu verstehen

**Schlecht:** Alles mocken bis der Test "funktioniert".

```typescript
// FALSCH: Zu viele Mocks verstecken echte Probleme
test('calculateCapacity', () => {
  vi.mock('@/stores/team-store');
  vi.mock('@/lib/date-utils');
  vi.mock('@/lib/math-utils');
  // Test laeuft — aber was testet er noch?
});

// RICHTIG: Nur externe I/O mocken, Logik echt lassen
test('calculateCapacity with known inputs', () => {
  const teams = [{ name: 'Dev', capacity: 10 }, { name: 'BA', capacity: 8 }];
  const result = calculateCapacity(teams, 4); // 4 Wochen
  expect(result.total).toBe(72); // (10+8) * 4
});
```

**Gate-Frage:** Verstehe ich was jeder Mock ersetzt und warum?

## Anti-Pattern 4: Unvollstaendige Mocks

**Schlecht:** Partielle Mocks die strukturelle Annahmen verstecken.

```typescript
// FALSCH: Mock hat nur die Felder die der Test braucht
const mockMandant = { name: 'Test' };
// Produktion erwartet: { id, name, type, settings, ... }

// RICHTIG: Vollstaendiges Mock-Objekt oder Factory
const mockMandant = createMockMandant({ name: 'Test' });
// Factory fuellt alle Pflichtfelder mit Defaults
```

## Anti-Pattern 5: Integration-Tests als Nachgedanke

> "Testen ist Teil der Implementierung, nicht optionaler Follow-up."

**Schlecht:** Code schreiben → "funktioniert" → Tests als Pflichtuebung ergaenzen.
**Richtig:** Test schreiben → Code schreiben → Test besteht → naechster Test.

## ESF-spezifische Anti-Patterns

### Anti-Pattern 6: Store-Feld-Mismatch nicht getestet

```typescript
// FALSCH: Kein Test fuer Feld-Zugriff
const mandant = useStore(state => state.mandant); // ← Feld heisst currentMandant!

// RICHTIG: Unit-Test der Store-Selektoren prueft
test('mandant selector returns currentMandant', () => {
  const store = createStore({ currentMandant: testMandant });
  const result = mandantSelector(store.getState());
  expect(result).toBe(testMandant);
});
```

### Anti-Pattern 7: Cache-Sharing nicht getestet

```typescript
// FALSCH: useState in Custom Hook — jede Komponente bekommt eigene Kopie
export function useData() {
  const [data, setData] = useState(null);
  // ...
}

// RICHTIG: Unit-Test beweist Sharing
test('useData shares state across consumers', () => {
  // Zwei Komponenten nutzen useData
  // Eine aktualisiert → andere sieht Update
});
```
