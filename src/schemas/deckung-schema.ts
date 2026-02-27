/**
 * Zod Schemas: Deckung
 * Validierungsschemas für Deckungsabfragen
 */

import { z } from 'zod'

// Deckungsumfang Produkte Schema
export const deckungsumfangProdukteSchema = z.object({
  haftpflicht: z.boolean().default(true),
  vollkasko: z.boolean().default(false),
  teilkasko: z.boolean().default(false),
  insassenUnfall: z.boolean().default(false),
  schutzbrief: z.boolean().default(false),
  fahrerrechtsschutz: z.boolean().default(false),
})

// Deckungsparameter Schema
export const deckungsparameterSchema = z.object({
  selbstbeteiligungVK: z
    .number()
    .int()
    .min(0, 'Selbstbeteiligung kann nicht negativ sein')
    .max(10000, 'Selbstbeteiligung unrealistisch hoch')
    .optional(),
  selbstbeteiligungTK: z
    .number()
    .int()
    .min(0, 'Selbstbeteiligung kann nicht negativ sein')
    .max(5000, 'Selbstbeteiligung unrealistisch hoch')
    .optional(),
  deckungssummeHaftpflicht: z
    .number()
    .min(7500000, 'Deckungssumme muss mindestens 7,5 Mio. EUR betragen')
    .max(200000000, 'Deckungssumme unrealistisch hoch')
    .optional(),
  deckungssummeInsassen: z
    .number()
    .min(0)
    .max(10000000, 'Deckungssumme unrealistisch hoch')
    .optional(),
  glasSchadenOhneSB: z.boolean().optional(),
  marderbissErweitert: z.boolean().optional(),
  wildschadenErweitert: z.boolean().optional(),
  neupreisentschaedigung: z
    .number()
    .int()
    .min(0)
    .max(36, 'Neupreisentschädigung max. 36 Monate')
    .optional(),
  kaufpreisEntschaedigung: z
    .number()
    .int()
    .min(0)
    .max(48, 'Kaufpreisentschädigung max. 48 Monate')
    .optional(),
  fahrerrechtsschutz: z.boolean().optional(),
})

// Deckungsanfrage Schema
export const deckungsanfrageSchema = z
  .object({
    produkte: deckungsumfangProdukteSchema,
    parameter: deckungsparameterSchema,
    versicherungsbeginn: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum muss im Format YYYY-MM-DD sein')
      .optional(),
    laufzeitMonate: z
      .number()
      .int()
      .min(1, 'Laufzeit muss mindestens 1 Monat betragen')
      .max(120, 'Laufzeit max. 10 Jahre')
      .optional(),
    nettoisierung: z.boolean().default(false),
    alternativangebote: z.boolean().default(false),
    notizen: z.string().max(2000, 'Notizen zu lang').optional(),
  })
  .refine(
    (data) => {
      // Mindestens Haftpflicht muss ausgewählt sein
      return data.produkte.haftpflicht
    },
    {
      message: 'Haftpflichtversicherung ist Pflicht',
      path: ['produkte', 'haftpflicht'],
    }
  )
  .refine(
    (data) => {
      // Wenn Vollkasko, dann auch SB
      if (data.produkte.vollkasko && !data.parameter.selbstbeteiligungVK) {
        return false
      }
      return true
    },
    {
      message: 'Bei Vollkasko ist eine Selbstbeteiligung erforderlich',
      path: ['parameter', 'selbstbeteiligungVK'],
    }
  )
  .refine(
    (data) => {
      // Wenn Teilkasko, dann auch SB
      if (data.produkte.teilkasko && !data.parameter.selbstbeteiligungTK) {
        return false
      }
      return true
    },
    {
      message: 'Bei Teilkasko ist eine Selbstbeteiligung erforderlich',
      path: ['parameter', 'selbstbeteiligungTK'],
    }
  )

// Typen aus Schemas ableiten
export type DeckungsumfangProdukteSchemaType = z.infer<typeof deckungsumfangProdukteSchema>
export type DeckungsparameterSchemaType = z.infer<typeof deckungsparameterSchema>
export type DeckungsanfrageSchemaType = z.infer<typeof deckungsanfrageSchema>
