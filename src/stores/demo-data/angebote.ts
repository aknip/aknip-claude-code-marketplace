/**
 * Angebote und Vorquotierungen für KFZ-Flottenversicherung
 */

import { type Versicherer, versicherer } from './versicherer'
import { type Rahmenkonzept, rahmenkonzepte } from './rahmenkonzepte'

export type AngebotStatus =
  | 'angefordert' // Vorquotierung an Versicherer gesendet
  | 'in_bearbeitung' // Versicherer prüft
  | 'angebot_erhalten' // Angebot liegt vor
  | 'angenommen' // Angebot angenommen
  | 'abgelehnt_versicherer' // Versicherer lehnt ab
  | 'abgelehnt_kunde' // Kunde lehnt ab
  | 'verfallen' // Gültigkeit abgelaufen

export interface Deckungsumfang {
  haftpflicht: boolean
  vollkasko: boolean
  teilkasko: boolean
  insassenUnfall: boolean
  schutzbrief: boolean
  fahrerrechtsschutz: boolean
}

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
  deckungsumfang: Deckungsumfang

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

// Demo-Angebote für Anfrage ANF-2024-0002 (Musterfirma GmbH)
export const angebote: Angebot[] = [
  {
    id: 'ang-001',
    anfrageId: 'anf-002',
    anfrageNummer: 'ANF-2024-0002',
    versicherer: versicherer[0], // Allianz
    rahmenkonzeptId: 'rk-001',
    rahmenkonzept: rahmenkonzepte[0],
    status: 'angebot_erhalten',
    angebotsNummer: 'ALZ-Q-2024-0152',
    angefordertAm: '2024-10-25T10:00:00Z',
    angebotsEingangAm: '2024-10-28T14:30:00Z',
    gueltigBis: '2024-12-15',
    deckungsumfang: {
      haftpflicht: true,
      vollkasko: true,
      teilkasko: true,
      insassenUnfall: false,
      schutzbrief: false,
      fahrerrechtsschutz: true,
    },
    jahrespraemieNetto: 58750,
    jahrespraemieBrutto: 69912,
    versicherungssteuer: 19,
    provisionsanteil: 7050,
    konditionen: [
      {
        bezeichnung: 'Deckungssumme Haftpflicht',
        wert: 100000000,
        einheit: 'EUR',
        hervorheben: true,
      },
      {
        bezeichnung: 'Selbstbeteiligung Vollkasko',
        wert: 500,
        einheit: 'EUR',
      },
      {
        bezeichnung: 'Selbstbeteiligung Teilkasko',
        wert: 150,
        einheit: 'EUR',
      },
      {
        bezeichnung: 'Neupreisentschädigung',
        wert: 24,
        einheit: 'Monate',
        hervorheben: true,
      },
      {
        bezeichnung: 'Kaufpreisentschädigung',
        wert: 36,
        einheit: 'Monate',
      },
      {
        bezeichnung: 'Glasschaden ohne SB',
        wert: 'Ja',
      },
      {
        bezeichnung: 'Wildschaden erweitert',
        wert: 'Ja',
      },
      {
        bezeichnung: 'Marderbiss erweitert',
        wert: 'Ja',
      },
    ],
    selbstbeteiligungVollkasko: 500,
    selbstbeteiligungTeilkasko: 150,
    besonderheiten: [
      'GAP-Deckung inklusive',
      'Online-Schadenmanagement verfügbar',
      'Telematik-Rabatt 5% möglich',
      'Werkstattbindung flexibel',
    ],
    ausschlüsse: [
      'Fahrten außerhalb EU nur nach Anmeldung',
      'Motorsportveranstaltungen ausgeschlossen',
    ],
    score: 88,
    empfohlen: true,
    interneNotiz: 'Sehr gutes Preis-Leistungs-Verhältnis, bewährter Partner',
  },
  {
    id: 'ang-002',
    anfrageId: 'anf-002',
    anfrageNummer: 'ANF-2024-0002',
    versicherer: versicherer[1], // AXA
    rahmenkonzeptId: 'rk-002',
    rahmenkonzept: rahmenkonzepte[1],
    status: 'angebot_erhalten',
    angebotsNummer: 'AXA-FL-2024-0089',
    angefordertAm: '2024-10-25T10:00:00Z',
    angebotsEingangAm: '2024-10-27T16:45:00Z',
    gueltigBis: '2024-12-10',
    deckungsumfang: {
      haftpflicht: true,
      vollkasko: false,
      teilkasko: true,
      insassenUnfall: false,
      schutzbrief: false,
      fahrerrechtsschutz: false,
    },
    jahrespraemieNetto: 47200,
    jahrespraemieBrutto: 56168,
    versicherungssteuer: 19,
    provisionsanteil: 5428,
    konditionen: [
      {
        bezeichnung: 'Deckungssumme Haftpflicht',
        wert: 50000000,
        einheit: 'EUR',
      },
      {
        bezeichnung: 'Selbstbeteiligung Teilkasko',
        wert: 300,
        einheit: 'EUR',
      },
      {
        bezeichnung: 'Wildschaden erweitert',
        wert: 'Ja',
      },
      {
        bezeichnung: 'Glasschaden ohne SB',
        wert: 'Nein',
      },
    ],
    selbstbeteiligungTeilkasko: 300,
    besonderheiten: [
      'Schnelle Schadenregulierung',
      'Flottenmanager-Tool inklusive',
      'Flexible Selbstbeteiligung wählbar',
    ],
    ausschlüsse: [
      'Marderschäden nur bis 1.500 EUR',
      'Tierbissschäden nur Haarwild',
    ],
    score: 72,
    empfohlen: false,
    interneNotiz: 'Günstig, aber eingeschränkter Leistungsumfang',
  },
  {
    id: 'ang-003',
    anfrageId: 'anf-002',
    anfrageNummer: 'ANF-2024-0002',
    versicherer: versicherer[2], // HDI
    rahmenkonzeptId: 'rk-003',
    rahmenkonzept: rahmenkonzepte[2],
    status: 'angebot_erhalten',
    angebotsNummer: 'HDI-2024-F-0234',
    angefordertAm: '2024-10-25T10:00:00Z',
    angebotsEingangAm: '2024-10-29T11:20:00Z',
    gueltigBis: '2024-12-05',
    deckungsumfang: {
      haftpflicht: true,
      vollkasko: false,
      teilkasko: false,
      insassenUnfall: false,
      schutzbrief: false,
      fahrerrechtsschutz: false,
    },
    jahrespraemieNetto: 38950,
    jahrespraemieBrutto: 46350,
    versicherungssteuer: 19,
    provisionsanteil: 3895,
    konditionen: [
      {
        bezeichnung: 'Deckungssumme Haftpflicht',
        wert: 50000000,
        einheit: 'EUR',
      },
    ],
    besonderheiten: [
      'Günstige Basisprämie',
      'Einfache Verwaltung',
    ],
    score: 65,
    empfohlen: false,
    interneNotiz: 'Nur Haftpflicht, für Musterfirma zu wenig Deckung',
  },
  {
    id: 'ang-004',
    anfrageId: 'anf-002',
    anfrageNummer: 'ANF-2024-0002',
    versicherer: versicherer[3], // Zurich
    rahmenkonzeptId: 'rk-004',
    rahmenkonzept: rahmenkonzepte[3],
    status: 'abgelehnt_versicherer',
    angebotsNummer: 'ZUR-FL-2024-0067',
    angefordertAm: '2024-10-25T10:00:00Z',
    angebotsEingangAm: '2024-10-30T09:15:00Z',
    gueltigBis: '2024-12-20',
    deckungsumfang: {
      haftpflicht: false,
      vollkasko: false,
      teilkasko: false,
      insassenUnfall: false,
      schutzbrief: false,
      fahrerrechtsschutz: false,
    },
    jahrespraemieNetto: 0,
    jahrespraemieBrutto: 0,
    versicherungssteuer: 19,
    provisionsanteil: 0,
    konditionen: [],
    ablehnungsgrund: 'KO-Kriterien nicht erfüllt: Schadenquote 68,5% > 65%, Fahrzeugalter > 10 Jahre',
    interneNotiz: 'Ablehnung aufgrund zu hoher Schadenquote und Flottenalter',
  },
  {
    id: 'ang-005',
    anfrageId: 'anf-002',
    anfrageNummer: 'ANF-2024-0002',
    versicherer: versicherer[4], // R+V
    rahmenkonzeptId: 'rk-002',
    status: 'in_bearbeitung',
    angebotsNummer: 'RV-2024-FL-0112',
    angefordertAm: '2024-10-25T10:00:00Z',
    gueltigBis: '2024-12-15',
    deckungsumfang: {
      haftpflicht: false,
      vollkasko: false,
      teilkasko: false,
      insassenUnfall: false,
      schutzbrief: false,
      fahrerrechtsschutz: false,
    },
    jahrespraemieNetto: 0,
    jahrespraemieBrutto: 0,
    versicherungssteuer: 19,
    provisionsanteil: 0,
    konditionen: [],
    interneNotiz: 'Angebot steht noch aus, Prüfung läuft',
  },
]

// Hilfsfunktionen
export function getAngeboteFuerAnfrage(anfrageId: string): Angebot[] {
  return angebote.filter((a) => a.anfrageId === anfrageId)
}

export function getEmpfohleneAngebote(anfrageId: string): Angebot[] {
  return angebote.filter((a) => a.anfrageId === anfrageId && a.empfohlen && a.status === 'angebot_erhalten')
}

export function getBesteAngebot(anfrageId: string): Angebot | undefined {
  const angeboteliste = angebote.filter(
    (a) => a.anfrageId === anfrageId && a.status === 'angebot_erhalten'
  )

  if (angeboteliste.length === 0) return undefined

  // Sortiere nach Score (höchster zuerst)
  return angeboteliste.sort((a, b) => (b.score || 0) - (a.score || 0))[0]
}
