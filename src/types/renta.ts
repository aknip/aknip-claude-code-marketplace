/**
 * Shared Types: Renta (Rentabilitätsanalyse)
 * Konsolidierte Typen für Rentabilitätsdaten
 */

export type FlottenEntwicklung = 'gewachsen' | 'stabil' | 'geschrumpft'

export interface SpartenJahresDaten {
  praemie: number
  schaeden: number
  aufwand: number
  auszahlung: number
  quote: number // Schadenquote in %
}

export interface JahresRenta {
  jahr: number

  // Prämien
  bruttoJahrespraemie: number
  nettoJahrespraemie: number // nach Provisionen/Kosten
  praemieneinnahmen: number // tatsächlich gezahlt

  // Schäden
  anzahlSchaeden: number
  schadenaufwand: number // Gesamtschadensumme
  auszahlungen: number // tatsächlich reguliert
  reserven: number // noch offene Reserven

  // Kennzahlen
  schadenquote: number // Schadenaufwand / Prämie in %
  kombinierteQuote: number // inkl. Kosten
  schadendurchschnitt: number // Durchschnittlicher Schaden
  schadenhaeufigkeit: number // Schäden pro 100 Fahrzeuge

  // Flotte
  anzahlFahrzeuge: number // Durchschnitt im Jahr
  flottenEntwicklung: FlottenEntwicklung

  // Details nach Sparte
  spartenDetails: {
    haftpflicht: SpartenJahresDaten
    vollkasko: SpartenJahresDaten
    teilkasko: SpartenJahresDaten
  }
}

export interface QuartalsRenta {
  jahr: number
  quartal: 1 | 2 | 3 | 4
  praemie: number
  schadenaufwand: number
  schadenquote: number
  anzahlSchaeden: number
  anzahlFahrzeuge: number
}

export interface MonatsRenta {
  jahr: number
  monat: number // 1-12
  praemie: number
  schadenaufwand: number
  schadenquote: number
  anzahlSchaeden: number
}

// Hilfsfunktionen für Berechnungen
export interface RentaKennzahlen {
  durchschnittlicheSchadenquote: number
  trend: 'steigend' | 'stabil' | 'sinkend'
  besterJahr: number
  schlechtesterJahr: number
}
