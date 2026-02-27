/**
 * Zod Schemas: Kunde
 * Validierungsschemas für Kundendaten
 */

import { z } from 'zod'

// Bankverbindung Schema
export const bankverbindungSchema = z.object({
  iban: z
    .string()
    .min(15, 'IBAN muss mindestens 15 Zeichen lang sein')
    .max(34, 'IBAN darf maximal 34 Zeichen lang sein')
    .regex(/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/, 'Ungültiges IBAN-Format'),
  bic: z
    .string()
    .min(8, 'BIC muss mindestens 8 Zeichen lang sein')
    .max(11, 'BIC darf maximal 11 Zeichen lang sein')
    .regex(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, 'Ungültiges BIC-Format'),
  bank: z.string().min(1, 'Bankname ist erforderlich'),
})

// Kunde Schema (vollständig)
export const kundeSchema = z.object({
  id: z.string().min(1),
  firmenname: z
    .string()
    .min(2, 'Firmenname muss mindestens 2 Zeichen lang sein')
    .max(200, 'Firmenname darf maximal 200 Zeichen lang sein'),
  rechtsform: z.string().min(1, 'Rechtsform ist erforderlich'),
  branche: z.string().min(1, 'Branche ist erforderlich'),
  strasse: z.string().min(1, 'Straße ist erforderlich'),
  plz: z
    .string()
    .regex(/^[0-9]{5}$/, 'PLZ muss genau 5 Ziffern enthalten'),
  ort: z.string().min(1, 'Ort ist erforderlich'),
  land: z.string().default('Deutschland'),
  telefon: z
    .string()
    .regex(/^\+?[0-9\s\-\/()]+$/, 'Ungültiges Telefonformat'),
  fax: z
    .string()
    .regex(/^\+?[0-9\s\-\/()]+$/, 'Ungültiges Faxformat')
    .optional(),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  website: z.string().url('Ungültige URL').optional().or(z.literal('')),
  ansprechpartner: z.string().min(1, 'Ansprechpartner ist erforderlich'),
  ansprechpartnerPosition: z.string().min(1, 'Position ist erforderlich'),
  ansprechpartnerTelefon: z
    .string()
    .regex(/^\+?[0-9\s\-\/()]+$/, 'Ungültiges Telefonformat'),
  ansprechpartnerEmail: z.string().email('Ungültige E-Mail-Adresse'),
  ustIdNr: z
    .string()
    .regex(/^DE[0-9]{9}$/, 'USt-IdNr muss dem Format DE123456789 entsprechen'),
  handelsregister: z.string().min(1, 'Handelsregisternummer ist erforderlich'),
  amtsgericht: z.string().min(1, 'Amtsgericht ist erforderlich'),
  gruendungsjahr: z
    .number()
    .int()
    .min(1800, 'Gründungsjahr muss nach 1800 liegen')
    .max(new Date().getFullYear(), 'Gründungsjahr darf nicht in der Zukunft liegen'),
  anzahlMitarbeiter: z
    .number()
    .int()
    .min(0, 'Anzahl Mitarbeiter muss mindestens 0 sein')
    .max(1000000, 'Anzahl Mitarbeiter ist unrealistisch hoch'),
  jahresumsatz: z
    .number()
    .min(0, 'Jahresumsatz muss mindestens 0 sein')
    .max(1000000000000, 'Jahresumsatz ist unrealistisch hoch'),
  bankverbindung: bankverbindungSchema,
  status: z.enum(['aktiv', 'inaktiv', 'neu']),
  erstelltAm: z.string(),
  aktualisiertAm: z.string(),
})

// Kunde Update Schema (partial, ohne id und erstelltAm)
export const kundeUpdateSchema = kundeSchema
  .omit({ id: true, erstelltAm: true })
  .partial()

// Kunde Eingabe Schema (für neue Kunden)
export const kundeEingabeSchema = kundeSchema.omit({
  id: true,
  erstelltAm: true,
  aktualisiertAm: true,
})

// Typen aus Schemas ableiten
export type KundeSchemaType = z.infer<typeof kundeSchema>
export type KundeUpdateSchemaType = z.infer<typeof kundeUpdateSchema>
export type KundeEingabeSchemaType = z.infer<typeof kundeEingabeSchema>
