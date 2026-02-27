/**
 * Zod Schemas: Fahrzeug
 * Validierungsschemas für Fahrzeugdaten
 */

import { z } from 'zod'

// Fahrzeug Schema (vollständig)
export const fahrzeugSchema = z.object({
  id: z.string().min(1),
  kennzeichen: z
    .string()
    .min(1, 'Kennzeichen ist erforderlich')
    .max(15, 'Kennzeichen zu lang')
    .regex(
      /^[A-ZÄÖÜ]{1,3}-[A-ZÄÖÜ]{1,2}\s?[0-9]{1,4}[EH]?$/,
      'Ungültiges deutsches Kennzeichen-Format'
    ),
  fahrzeugtyp: z.enum(['PKW', 'Transporter', 'LKW', 'Sattelzugmaschine', 'Anhänger']),
  hersteller: z.string().min(1, 'Hersteller ist erforderlich'),
  modell: z.string().min(1, 'Modell ist erforderlich'),
  erstzulassung: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum muss im Format YYYY-MM-DD sein')
    .refine((date) => {
      const d = new Date(date)
      return d <= new Date()
    }, 'Erstzulassung darf nicht in der Zukunft liegen'),
  hubraum: z
    .number()
    .int()
    .min(50, 'Hubraum zu niedrig')
    .max(20000, 'Hubraum unrealistisch hoch')
    .optional(),
  leistungKw: z
    .number()
    .min(1, 'Leistung muss mindestens 1 kW sein')
    .max(2000, 'Leistung unrealistisch hoch'),
  leistungPs: z
    .number()
    .min(1, 'Leistung muss mindestens 1 PS sein')
    .max(3000, 'Leistung unrealistisch hoch'),
  gesamtgewicht: z
    .number()
    .int()
    .min(100, 'Gesamtgewicht zu niedrig')
    .max(60000, 'Gesamtgewicht unrealistisch hoch'),
  nutzlast: z
    .number()
    .int()
    .min(0)
    .max(50000, 'Nutzlast unrealistisch hoch')
    .optional(),
  antriebsart: z.enum(['Diesel', 'Benzin', 'Elektro', 'Hybrid', 'CNG']),
  schadstoffklasse: z.string().min(1, 'Schadstoffklasse ist erforderlich'),
  fahrgestellnummer: z
    .string()
    .length(17, 'Fahrgestellnummer muss exakt 17 Zeichen lang sein')
    .regex(/^[A-HJ-NPR-Z0-9]{17}$/, 'Ungültige Fahrgestellnummer'),
  farbe: z.string().min(1, 'Farbe ist erforderlich'),
  kilometerstand: z
    .number()
    .int()
    .min(0, 'Kilometerstand kann nicht negativ sein')
    .max(5000000, 'Kilometerstand unrealistisch hoch'),
  nutzungsart: z.enum(['Werkverkehr', 'Güterverkehr', 'Personenbeförderung', 'gewerblich']),
  status: z.enum(['aktiv', 'stillgelegt', 'in_reparatur', 'verkauft']),
  versicherungsbeginn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum muss im Format YYYY-MM-DD sein'),
  jahrespraemieHaftpflicht: z
    .number()
    .min(0, 'Prämie kann nicht negativ sein')
    .max(100000, 'Prämie unrealistisch hoch'),
  jahrespraemieVollkasko: z
    .number()
    .min(0)
    .max(100000, 'Prämie unrealistisch hoch')
    .optional(),
  jahrespraemieTeilkasko: z
    .number()
    .min(0)
    .max(100000, 'Prämie unrealistisch hoch')
    .optional(),
  selbstbeteiligungVollkasko: z
    .number()
    .int()
    .min(0)
    .max(10000, 'Selbstbeteiligung unrealistisch hoch')
    .optional(),
  selbstbeteiligungTeilkasko: z
    .number()
    .int()
    .min(0)
    .max(5000, 'Selbstbeteiligung unrealistisch hoch')
    .optional(),
  fahrer: z.string().optional(),
  abteilung: z.string().optional(),
  standort: z.string().min(1, 'Standort ist erforderlich'),
  letzteHU: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum muss im Format YYYY-MM-DD sein'),
  naechsteHU: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum muss im Format YYYY-MM-DD sein'),
  notizen: z.string().max(1000, 'Notizen zu lang').optional(),
})

// Fahrzeug Eingabe Schema (vereinfacht, für Formulare)
export const fahrzeugEingabeSchema = z.object({
  kennzeichen: z
    .string()
    .min(1, 'Kennzeichen ist erforderlich')
    .max(15, 'Kennzeichen zu lang'),
  fahrzeugtyp: z.enum(['PKW', 'Transporter', 'LKW', 'Sattelzugmaschine', 'Anhänger']),
  hersteller: z.string().min(1, 'Hersteller ist erforderlich'),
  modell: z.string().min(1, 'Modell ist erforderlich'),
  erstzulassung: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum muss im Format YYYY-MM-DD sein'),
  neuwert: z
    .number()
    .min(0, 'Neuwert kann nicht negativ sein')
    .max(10000000, 'Neuwert unrealistisch hoch')
    .optional(),
  zeitwert: z
    .number()
    .min(0, 'Zeitwert kann nicht negativ sein')
    .max(10000000, 'Zeitwert unrealistisch hoch')
    .optional(),
  nutzungsart: z.string().min(1, 'Nutzungsart ist erforderlich'),
})

// Typen aus Schemas ableiten
export type FahrzeugSchemaType = z.infer<typeof fahrzeugSchema>
export type FahrzeugEingabeSchemaType = z.infer<typeof fahrzeugEingabeSchema>
