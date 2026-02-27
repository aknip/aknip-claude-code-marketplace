/**
 * Shared Types: Anfrage
 * Konsolidierte Typen für Versicherungsanfragen
 */

import { type Kunde } from './kunde'

export type AnfrageStatus =
  | 'entwurf' // Makler arbeitet noch daran
  | 'eingereicht' // Vom Makler eingereicht
  | 'in_pruefung' // Assekuradeur prüft
  | 'rueckfrage' // Assekuradeur hat Rückfragen
  | 'deckungsanfrage' // An Versicherer weitergeleitet
  | 'angebot_erstellt' // Angebot liegt vor
  | 'nachverhandlung' // In Nachverhandlung
  | 'angenommen' // Kunde hat angenommen
  | 'abgelehnt' // Abgelehnt (von beliebiger Partei)
  | 'vertrag_aktiv' // Vertrag abgeschlossen und aktiv

export type Dringlichkeit = 'niedrig' | 'normal' | 'hoch' | 'dringend'

export type Produkttyp = 'kfz_flotte' | 'kfz_einzelfahrzeug' | 'transport' | 'haftpflicht'

export type WorkflowSchrittStatus = 'abgeschlossen' | 'aktuell' | 'offen'

export interface WorkflowSchritt {
  schritt: string
  status: WorkflowSchrittStatus
  bearbeiter?: string
  datum?: string
  notizen?: string
}

export type DokumentTyp =
  | 'fuhrparkliste'
  | 'schadenverlauf'
  | 'vertrag'
  | 'angebot'
  | 'deckungsbestaetigung'
  | 'sonstiges'

export interface Dokument {
  id: string
  name: string
  typ: DokumentTyp
  datum: string
  groesse?: string
}

export interface MaklerInfo {
  name: string
  email: string
  telefon: string
  unternehmen: string
}

export interface AssekuradeurInfo {
  sachbearbeiter: string
  email: string
}

export interface VersichererInfo {
  name: string
  ansprechpartner?: string
}

export interface Anfrage {
  id: string
  anfrageNummer: string
  kundeId: string
  kunde: Kunde
  produkttyp: Produkttyp
  status: AnfrageStatus
  dringlichkeit: Dringlichkeit

  // Anfrage-Details
  versicherungsbeginn: string
  laufzeit: number // in Monaten
  anzahlFahrzeuge: number
  gesamtPraemie?: number

  // Workflow
  workflow: WorkflowSchritt[]
  aktuellerSchritt: number // 1-6

  // Beteiligte
  makler: MaklerInfo
  assekuradeur?: AssekuradeurInfo
  versicherer?: VersichererInfo

  // Dokumente
  dokumente: Dokument[]

  // Zeitstempel
  erstelltAm: string
  aktualisiertAm: string
  eingereichtAm?: string
  angebotBis?: string

  // Notizen und Kommunikation
  interneNotizen?: string
  kundenwuensche?: string
  besonderheiten?: string
}

// Anfrage-Erstellung (für Formulare)
export type AnfrageEingabe = Omit<
  Anfrage,
  'id' | 'anfrageNummer' | 'workflow' | 'aktuellerSchritt' | 'erstelltAm' | 'aktualisiertAm'
>

// Anfrage-Update
export type AnfrageUpdate = Partial<
  Omit<Anfrage, 'id' | 'anfrageNummer' | 'erstelltAm'>
>

// Anfrage-Statistiken
export interface AnfrageStatistik {
  gesamt: number
  entwuerfe: number
  eingereicht: number
  inBearbeitung: number
  mitAngebot: number
  angenommen: number
  abgelehnt: number
  vertraege: number
}
