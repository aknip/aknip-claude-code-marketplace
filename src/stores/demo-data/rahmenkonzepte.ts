/**
 * Rahmenkonzepte für KFZ-Flottenversicherung
 * Definiert verfügbare Versicherungsprodukte und Deckungsvarianten
 */

export type Produktart = 'kfz_haftpflicht' | 'vollkasko' | 'teilkasko' | 'insassen_unfall' | 'schutzbrief'

export type DeckungsStufe = 'basis' | 'komfort' | 'premium'

export interface Deckungsparameter {
  selbstbeteiligungVK?: number // Vollkasko
  selbstbeteiligungTK?: number // Teilkasko
  deckungssummeHaftpflicht?: number
  deckungssummeInsassen?: number
  glasSchadenOhneSB?: boolean
  marderbissErweitert?: boolean
  wildschadenErweitert?: boolean
  neupreisentschaedigung?: number // in Monaten
  kaufpreisEntschaedigung?: number // in Monaten
  fahrerrechtsschutz?: boolean
}

export interface KOKriterium {
  id: string
  beschreibung: string
  parameter: string
  schwellwert: number | string
  erfuellt: boolean
  prioritaet: 'hoch' | 'mittel' | 'niedrig'
}

export interface Rahmenkonzept {
  id: string
  name: string
  versicherer: string
  produktart: Produktart[]
  deckungsStufe: DeckungsStufe
  gueltigAb: string
  gueltigBis: string

  // Deckungsparameter
  deckungsparameter: Deckungsparameter

  // KO-Kriterien
  koKriterien: KOKriterium[]

  // Konditionen
  minFahrzeuge: number
  maxFahrzeuge: number
  minJahrespraemie?: number
  maxSchadenquote?: number // in %

  // Pricing
  basisPraemieProFahrzeug: number
  aufschlagVollkasko: number // in %
  aufschlagTeilkasko: number // in %
  rabattStaffel: { abFahrzeuge: number; rabatt: number }[] // Mengenrabatt

  // Status
  status: 'aktiv' | 'inaktiv' | 'ausgelaufen'

  // Metadaten
  beschreibung: string
  besonderheiten?: string[]
}

// Rahmenkonzepte Demo-Daten
export const rahmenkonzepte: Rahmenkonzept[] = [
  {
    id: 'rk-001',
    name: 'Best Insure Flottenkonzept Pro',
    versicherer: 'Best Insure',
    produktart: ['kfz_haftpflicht', 'vollkasko', 'teilkasko'],
    deckungsStufe: 'premium',
    gueltigAb: '2024-01-01',
    gueltigBis: '2024-12-31',
    deckungsparameter: {
      selbstbeteiligungVK: 500,
      selbstbeteiligungTK: 150,
      deckungssummeHaftpflicht: 100000000,
      glasSchadenOhneSB: true,
      marderbissErweitert: true,
      wildschadenErweitert: true,
      neupreisentschaedigung: 24,
      kaufpreisEntschaedigung: 36,
      fahrerrechtsschutz: true,
    },
    koKriterien: [
      {
        id: 'ko-001',
        beschreibung: 'Schadenquote maximal 70%',
        parameter: 'schadenquote',
        schwellwert: 70,
        erfuellt: true,
        prioritaet: 'hoch',
      },
      {
        id: 'ko-002',
        beschreibung: 'Mindestens 30 Fahrzeuge',
        parameter: 'anzahlFahrzeuge',
        schwellwert: 30,
        erfuellt: true,
        prioritaet: 'hoch',
      },
      {
        id: 'ko-003',
        beschreibung: 'Keine Fahrzeuge älter als 12 Jahre',
        parameter: 'maxFahrzeugAlter',
        schwellwert: 12,
        erfuellt: true,
        prioritaet: 'mittel',
      },
      {
        id: 'ko-004',
        beschreibung: 'Branche: Logistik, Transport, Handwerk',
        parameter: 'branche',
        schwellwert: 'Logistik',
        erfuellt: true,
        prioritaet: 'niedrig',
      },
    ],
    minFahrzeuge: 30,
    maxFahrzeuge: 500,
    minJahrespraemie: 50000,
    maxSchadenquote: 70,
    basisPraemieProFahrzeug: 850,
    aufschlagVollkasko: 45,
    aufschlagTeilkasko: 18,
    rabattStaffel: [
      { abFahrzeuge: 50, rabatt: 5 },
      { abFahrzeuge: 100, rabatt: 10 },
      { abFahrzeuge: 200, rabatt: 15 },
    ],
    status: 'aktiv',
    beschreibung: 'Premium-Flottenkonzept für mittlere bis große Flotten mit umfassenden Deckungen',
    besonderheiten: [
      'GAP-Deckung inklusive',
      'Werkstattbindung flexibel',
      'Online-Schadenmanagement',
      'Telematik-Rabatt möglich',
    ],
  },
  {
    id: 'rk-002',
    name: 'Best Insure Gewerbeflotte Komfort',
    versicherer: 'Best Insure',
    produktart: ['kfz_haftpflicht', 'teilkasko'],
    deckungsStufe: 'komfort',
    gueltigAb: '2024-01-01',
    gueltigBis: '2024-12-31',
    deckungsparameter: {
      selbstbeteiligungTK: 300,
      deckungssummeHaftpflicht: 50000000,
      glasSchadenOhneSB: false,
      marderbissErweitert: false,
      wildschadenErweitert: true,
      fahrerrechtsschutz: false,
    },
    koKriterien: [
      {
        id: 'ko-101',
        beschreibung: 'Schadenquote maximal 80%',
        parameter: 'schadenquote',
        schwellwert: 80,
        erfuellt: true,
        prioritaet: 'hoch',
      },
      {
        id: 'ko-102',
        beschreibung: 'Mindestens 20 Fahrzeuge',
        parameter: 'anzahlFahrzeuge',
        schwellwert: 20,
        erfuellt: true,
        prioritaet: 'hoch',
      },
      {
        id: 'ko-103',
        beschreibung: 'Keine Fahrzeuge älter als 15 Jahre',
        parameter: 'maxFahrzeugAlter',
        schwellwert: 15,
        erfuellt: true,
        prioritaet: 'mittel',
      },
    ],
    minFahrzeuge: 20,
    maxFahrzeuge: 300,
    minJahrespraemie: 30000,
    maxSchadenquote: 80,
    basisPraemieProFahrzeug: 720,
    aufschlagVollkasko: 40,
    aufschlagTeilkasko: 15,
    rabattStaffel: [
      { abFahrzeuge: 40, rabatt: 5 },
      { abFahrzeuge: 80, rabatt: 8 },
      { abFahrzeuge: 150, rabatt: 12 },
    ],
    status: 'aktiv',
    beschreibung: 'Solides Flottenkonzept für kleine bis mittlere Flotten',
    besonderheiten: [
      'Flexible Selbstbeteiligung',
      'Schnelle Schadenregulierung',
      'Flottenmanager-Tool inklusive',
    ],
  },
]

// Hilfsfunktion: Rahmenkonzepte für eine Anfrage filtern
export function getRahmenkonzepteFuerAnfrage(anzahlFahrzeuge: number, schadenquote: number): Rahmenkonzept[] {
  return rahmenkonzepte.filter((rk) => {
    // Prüfe Fahrzeuganzahl
    const fahrzeugOk = anzahlFahrzeuge >= rk.minFahrzeuge && anzahlFahrzeuge <= rk.maxFahrzeuge

    // Prüfe Schadenquote
    const schadenquoteOk = !rk.maxSchadenquote || schadenquote <= rk.maxSchadenquote

    // Nur aktive Rahmenkonzepte
    const statusOk = rk.status === 'aktiv'

    return fahrzeugOk && schadenquoteOk && statusOk
  })
}

// Hilfsfunktion: Berechne Prämie für ein Rahmenkonzept
export function berechnePraemie(
  rahmenkonzept: Rahmenkonzept,
  anzahlFahrzeuge: number,
  mitVollkasko: boolean = false,
  mitTeilkasko: boolean = false
): number {
  let praemie = rahmenkonzept.basisPraemieProFahrzeug * anzahlFahrzeuge

  // Aufschläge
  if (mitVollkasko) {
    praemie += (praemie * rahmenkonzept.aufschlagVollkasko) / 100
  }
  if (mitTeilkasko) {
    praemie += (praemie * rahmenkonzept.aufschlagTeilkasko) / 100
  }

  // Mengenrabatt
  let rabatt = 0
  for (const staffel of rahmenkonzept.rabattStaffel) {
    if (anzahlFahrzeuge >= staffel.abFahrzeuge) {
      rabatt = staffel.rabatt
    }
  }
  praemie -= (praemie * rabatt) / 100

  return Math.round(praemie)
}
