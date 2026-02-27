/**
 * Zod Schemas: Anfrage
 * Validierungsschemas für Versicherungsanfragen
 */

import { z } from 'zod'

// Dokument Schema
export const dokumentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Dokumentenname ist erforderlich'),
  typ: z.enum([
    'fuhrparkliste',
    'schadenverlauf',
    'vertrag',
    'angebot',
    'deckungsbestaetigung',
    'sonstiges',
  ]),
  datum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum muss im Format YYYY-MM-DD sein'),
  groesse: z.string().optional(),
})

// Workflow-Schritt Schema
export const workflowSchrittSchema = z.object({
  schritt: z.string().min(1, 'Schrittname ist erforderlich'),
  status: z.enum(['abgeschlossen', 'aktuell', 'offen']),
  bearbeiter: z.string().optional(),
  datum: z.string().optional(),
  notizen: z.string().max(500, 'Notizen zu lang').optional(),
})

// Makler Info Schema
export const maklerInfoSchema = z.object({
  name: z.string().min(1, 'Maklername ist erforderlich'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  telefon: z
    .string()
    .regex(/^\+?[0-9\s\-\/()]+$/, 'Ungültiges Telefonformat'),
  unternehmen: z.string().min(1, 'Unternehmen ist erforderlich'),
})

// Anfrage Schema (vollständig)
export const anfrageSchema = z.object({
  id: z.string().min(1),
  anfrageNummer: z.string().min(1),
  kundeId: z.string().min(1, 'Kunden-ID ist erforderlich'),
  produkttyp: z.enum(['kfz_flotte', 'kfz_einzelfahrzeug', 'transport', 'haftpflicht']),
  status: z.enum([
    'entwurf',
    'eingereicht',
    'in_pruefung',
    'rueckfrage',
    'deckungsanfrage',
    'angebot_erstellt',
    'nachverhandlung',
    'angenommen',
    'abgelehnt',
    'vertrag_aktiv',
  ]),
  dringlichkeit: z.enum(['niedrig', 'normal', 'hoch', 'dringend']),
  versicherungsbeginn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum muss im Format YYYY-MM-DD sein')
    .refine((date) => {
      const d = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return d >= today
    }, 'Versicherungsbeginn darf nicht in der Vergangenheit liegen'),
  laufzeit: z
    .number()
    .int()
    .min(1, 'Laufzeit muss mindestens 1 Monat betragen')
    .max(120, 'Laufzeit max. 10 Jahre'),
  anzahlFahrzeuge: z
    .number()
    .int()
    .min(1, 'Mindestens 1 Fahrzeug erforderlich')
    .max(10000, 'Anzahl Fahrzeuge unrealistisch hoch'),
  gesamtPraemie: z
    .number()
    .min(0, 'Prämie kann nicht negativ sein')
    .max(100000000, 'Prämie unrealistisch hoch')
    .optional(),
  workflow: z.array(workflowSchrittSchema),
  aktuellerSchritt: z.number().int().min(1).max(6),
  makler: maklerInfoSchema,
  dokumente: z.array(dokumentSchema).default([]),
  erstelltAm: z.string(),
  aktualisiertAm: z.string(),
  eingereichtAm: z.string().optional(),
  angebotBis: z.string().optional(),
  interneNotizen: z.string().max(2000, 'Notizen zu lang').optional(),
  kundenwuensche: z.string().max(2000, 'Kundenwünsche zu lang').optional(),
  besonderheiten: z.string().max(2000, 'Besonderheiten zu lang').optional(),
})

// Anfrage Eingabe Schema (für neue Anfragen)
export const anfrageEingabeSchema = anfrageSchema.omit({
  id: true,
  anfrageNummer: true,
  workflow: true,
  aktuellerSchritt: true,
  erstelltAm: true,
  aktualisiertAm: true,
})

// Anfrage Update Schema
export const anfrageUpdateSchema = anfrageSchema
  .omit({
    id: true,
    anfrageNummer: true,
    erstelltAm: true,
  })
  .partial()

// Typen aus Schemas ableiten
export type AnfrageSchemaType = z.infer<typeof anfrageSchema>
export type AnfrageEingabeSchemaType = z.infer<typeof anfrageEingabeSchema>
export type AnfrageUpdateSchemaType = z.infer<typeof anfrageUpdateSchema>
