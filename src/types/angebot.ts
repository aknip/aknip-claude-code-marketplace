/**
 * Shared Types: Angebot
 * Konsolidierte Typen für Versicherungsangebote und Vorquotierungen
 */

import { type Versicherer } from './versicherer'
import { type Rahmenkonzept } from './rahmenkonzept'
import { type DeckungsumfangProdukte } from './deckung'

export type AngebotStatus =
  | 'angefordert' // Vorquotierung an Versicherer gesendet
  | 'in_bearbeitung' // Versicherer prüft
  | 'angebot_erhalten' // Angebot liegt vor
  | 'angenommen' // Angebot angenommen
  | 'abgelehnt_versicherer' // Versicherer lehnt ab
  | 'abgelehnt_kunde' // Kunde lehnt ab
  | 'verfallen' // Gültigkeit abgelaufen

export interface Kondition {
  bezeichnung: string
  wert: string | number
  einheit?: string
  hervorheben?: boolean // Wichtige Konditionen markieren
}

export interface Angebot {
  id: string
  anfrageId: string
  anfrageNummer: string

  // Beteiligte
  versicherer: Versicherer
  rahmenkonzeptId: string
  rahmenkonzept?: Rahmenkonzept

  // Status und Zeitstempel
  status: AngebotStatus
  angebotsNummer: string
  angefordertAm: string
  angebotsEingangAm?: string
  gueltigBis: string

  // Deckung
  deckungsumfang: DeckungsumfangProdukte

  // Prämien
  jahrespraemieNetto: number
  jahrespraemieBrutto: number
  versicherungssteuer: number // in %
  provisionsanteil: number // in EUR

  // Konditionen
  konditionen: Kondition[]

  // Selbstbeteiligungen
  selbstbeteiligungVollkasko?: number
  selbstbeteiligungTeilkasko?: number

  // Besonderheiten
  besonderheiten?: string[]
  ausschlüsse?: string[]
  auflagen?: string[]

  // Scoring (intern)
  score?: number // 0-100, berechnet aus Preis, Leistung, Service
  empfohlen?: boolean

  // Notizen
  interneNotiz?: string
  ablehnungsgrund?: string
}

// Angebots-Vergleich
export interface AngebotVergleich {
  angebote: Angebot[]
  empfohlenesAngebot?: Angebot
  preisSpanne: {
    min: number
    max: number
    durchschnitt: number
  }
}

// Angebots-Statistik
export interface AngebotStatistik {
  angefordert: number
  inBearbeitung: number
  erhalten: number
  angenommen: number
  abgelehntVersicherer: number
  abgelehntKunde: number
  verfallen: number
}
