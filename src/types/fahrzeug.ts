/**
 * Shared Types: Fahrzeug
 * Konsolidierte Typen für Fahrzeugdaten
 */

export type Fahrzeugtyp = 'PKW' | 'Transporter' | 'LKW' | 'Sattelzugmaschine' | 'Anhänger'

export type Nutzungsart = 'Werkverkehr' | 'Güterverkehr' | 'Personenbeförderung' | 'gewerblich'

export type Fahrzeugstatus = 'aktiv' | 'stillgelegt' | 'in_reparatur' | 'verkauft'

export type Antriebsart = 'Diesel' | 'Benzin' | 'Elektro' | 'Hybrid' | 'CNG'

export interface Fahrzeug {
  id: string
  kennzeichen: string
  fahrzeugtyp: Fahrzeugtyp
  hersteller: string
  modell: string
  erstzulassung: string // YYYY-MM-DD
  hubraum?: number // ccm
  leistungKw: number
  leistungPs: number
  gesamtgewicht: number // kg
  nutzlast?: number // kg
  antriebsart: Antriebsart
  schadstoffklasse: string
  fahrgestellnummer: string
  farbe: string
  kilometerstand: number
  nutzungsart: Nutzungsart
  status: Fahrzeugstatus
  versicherungsbeginn: string
  jahrespraemieHaftpflicht: number
  jahrespraemieVollkasko?: number
  jahrespraemieTeilkasko?: number
  selbstbeteiligungVollkasko?: number
  selbstbeteiligungTeilkasko?: number
  fahrer?: string
  abteilung?: string
  standort: string
  letzteHU: string // Hauptuntersuchung
  naechsteHU: string
  notizen?: string
}

// Vereinfachte Variante für Formulare
export interface FahrzeugEingabe {
  kennzeichen: string
  fahrzeugtyp: Fahrzeugtyp
  hersteller: string
  modell: string
  erstzulassung: string
  neuwert?: number
  zeitwert?: number
  nutzungsart: string
}

// Type für Flottenstatistiken
export interface FlottenStatistik {
  anzahlFahrzeuge: number
  gesamtwert: number
  durchschnittsalter: number
  verteilungNachTyp: Record<Fahrzeugtyp, number>
  jahrespraemieGesamt: number
}
