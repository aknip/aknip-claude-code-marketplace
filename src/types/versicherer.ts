/**
 * Shared Types: Versicherer
 * Konsolidierte Typen für Versicherungsunternehmen
 */

export type VersichererStatus = 'aktiv' | 'inaktiv' | 'gesperrt'

export type Sparte =
  | 'kfz'
  | 'haftpflicht'
  | 'sach'
  | 'leben'
  | 'kranken'
  | 'unfall'

export interface Versicherer {
  id: string
  name: string
  kurzname: string
  logo?: string
  website: string
  telefon: string
  email: string

  // Adresse
  strasse: string
  plz: string
  ort: string
  land: string

  // Ansprechpartner
  ansprechpartner: {
    name: string
    position: string
    telefon: string
    email: string
  }[]

  // Fachliche Daten
  sparten: Sparte[]
  rating?: string // z.B. "AA+" von Rating-Agentur
  jahrespraemienvolumen?: number

  // Status
  status: VersichererStatus
  partnerSeit: string

  // Metadaten
  notizen?: string
}

// Versicherer-Statistik
export interface VersichererStatistik {
  anzahlAngebote: number
  anzahlVertraege: number
  praemienvolumen: number
  durchschnittlicheBearbeitungszeit: number // in Tagen
  ablehnungsquote: number // in %
}
