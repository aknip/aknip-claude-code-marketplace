/**
 * Shared Types: Vertrag
 * Konsolidierte Typen für Versicherungsverträge
 */

import { type Versicherer } from './versicherer'
import { type Kunde } from './kunde'
import { type DeckungsumfangProdukte } from './deckung'

export type VertragStatus = 'aktiv' | 'gekuendigt' | 'ausgelaufen' | 'storniert'

export type Zahlungsweise = 'jaehrlich' | 'halbjaehrlich' | 'vierteljaehrlich' | 'monatlich'

export interface Rechnungsempfaenger {
  firma: string
  strasse: string
  plz: string
  ort: string
}

export interface SEPAMandat {
  iban: string
  bic: string
  kontoinhaber: string
  mandatsReferenz: string
  mandatsDatum: string
}

export interface Vertrag {
  id: string
  vertragsNummer: string
  anfrageId: string
  angebotId: string

  // Vertragsparteien
  versicherer: Versicherer
  kunde: Kunde
  makler: {
    name: string
    email: string
    unternehmen: string
  }

  // Vertragsdaten
  versicherungsbeginn: string
  versicherungsende: string
  laufzeitMonate: number
  kuendigungsfrist: string // z.B. "3 Monate zum Jahresende"
  zahlungsweise: Zahlungsweise

  // Deckung
  deckungsumfang: DeckungsumfangProdukte
  anzahlFahrzeuge: number

  // Prämien
  jahrespraemieNetto: number
  jahrespraemieBrutto: number
  versicherungssteuer: number
  provisionsanteil: number

  // Selbstbeteiligungen
  selbstbeteiligungVollkasko?: number
  selbstbeteiligungTeilkasko?: number

  // Zahlung
  rechnungsempfaenger: Rechnungsempfaenger
  sepaMandat: SEPAMandat

  // Status
  status: VertragStatus
  kuendigungDatum?: string
  kuendigungsgrund?: string

  // Dokumente
  dokumente: {
    id: string
    name: string
    typ: 'versicherungsschein' | 'bedingungen' | 'produktinformation' | 'sepa_mandat' | 'sonstiges'
    datum: string
  }[]

  // Zeitstempel
  abgeschlossenAm: string
  aktualisiertAm: string

  // Notizen
  besonderheiten?: string[]
  interneNotizen?: string
}

// Vertrag-Statistik
export interface VertragStatistik {
  aktiv: number
  gekuendigt: number
  ausgelaufen: number
  versicherteFahrzeuge: number
  gesamtpraemienvolumen: number
  baldAuslaufend: number // ≤3 Monate
}
