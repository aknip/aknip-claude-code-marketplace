/**
 * Shared Types: Kunde
 * Konsolidierte Typen für Kundendaten
 */

export type KundenStatus = 'aktiv' | 'inaktiv' | 'neu'

export interface Bankverbindung {
  iban: string
  bic: string
  bank: string
}

export interface Kunde {
  id: string
  firmenname: string
  rechtsform: string
  branche: string
  strasse: string
  plz: string
  ort: string
  land: string
  telefon: string
  fax?: string
  email: string
  website?: string
  ansprechpartner: string
  ansprechpartnerPosition: string
  ansprechpartnerTelefon: string
  ansprechpartnerEmail: string
  ustIdNr: string
  handelsregister: string
  amtsgericht: string
  gruendungsjahr: number
  anzahlMitarbeiter: number
  jahresumsatz: number
  bankverbindung: Bankverbindung
  status: KundenStatus
  erstelltAm: string
  aktualisiertAm: string
}

// Partial type für Formulare/Updates
export type KundenUpdate = Partial<Omit<Kunde, 'id' | 'erstelltAm'>>

// Type für Kundensuche
export interface KundenSuchkriterien {
  firmenname?: string
  ort?: string
  branche?: string
  status?: KundenStatus
}
