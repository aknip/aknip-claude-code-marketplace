/**
 * Shared Types: Schaden (ESA - Einzelschadenaufstellung)
 * Konsolidierte Typen für Schadendaten
 */

export type SchadenTyp = 'Haftpflicht' | 'Vollkasko' | 'Teilkasko'

export type SchadenStatus =
  | 'gemeldet'
  | 'in_bearbeitung'
  | 'reguliert'
  | 'abgelehnt'
  | 'teilreguliert'

export type SchadenUrsache =
  | 'Kollision'
  | 'Auffahrunfall'
  | 'Parkschaden'
  | 'Wildschaden'
  | 'Glasschaden'
  | 'Diebstahl'
  | 'Vandalismus'
  | 'Hagel'
  | 'Sturm'
  | 'Brand'
  | 'Marderbiss'
  | 'Sonstiges'

export interface Schaden {
  id: string
  schadennummer: string
  fahrzeugId: string
  kennzeichen: string
  schadendatum: string // YYYY-MM-DD
  meldedatum: string
  schadenTyp: SchadenTyp
  schadenUrsache: SchadenUrsache
  beschreibung: string
  schadenort: string
  polizeilichAufgenommen: boolean
  aktenzeichen?: string
  schadenhoehe: number // Brutto
  selbstbeteiligung: number
  auszahlung: number
  status: SchadenStatus
  reguliertAm?: string
  gegnerBeteiligt: boolean
  gegnerName?: string
  gegnerVersicherung?: string
  personenschaden: boolean
  verletztePersonen?: number
  bemerkungen?: string
  sachbearbeiter: string
}

// ESA-Statistiken
export interface ESAStatistik {
  gesamtanzahlSchaeden: number
  gesamtschadenhoehe: number
  durchschnittlicherSchaden: number
  verteilungNachTyp: Record<SchadenTyp, number>
  verteilungNachUrsache: Record<SchadenUrsache, number>
  verteilungNachStatus: Record<SchadenStatus, number>
}

// Jahresübersicht
export interface JahresSchadenstatistik {
  jahr: number
  anzahlSchaeden: number
  schadenhoehe: number
  durchschnitt: number
}
