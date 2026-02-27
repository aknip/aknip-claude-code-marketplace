/**
 * Versicherer-Daten für KFZ-Flottenversicherung
 */

export interface Versicherer {
  id: string
  name: string
  kurzname: string
  typ: 'erstversicherer' | 'rueckversicherer'
  spezialisierung: string[]

  // Kontaktdaten
  kontakt: {
    ansprechpartner: string
    position: string
    email: string
    telefon: string
    mobil?: string
  }

  // Adresse
  adresse: {
    strasse: string
    plz: string
    ort: string
    land: string
  }

  // Bewertung und Konditionen
  rating: {
    finanzstaerke: 'A++' | 'A+' | 'A' | 'A-' | 'B+' | 'B'
    serviceQualitaet: 1 | 2 | 3 | 4 | 5 // 1 = sehr gut, 5 = mangelhaft
    schadenregulierung: 1 | 2 | 3 | 4 | 5 // Geschwindigkeit
  }

  // Geschäftsbeziehung
  partnerSeit: string
  rahmenvertragsNr?: string
  provision: number // in %
  zahlungsziel: number // in Tagen

  // Status
  status: 'aktiv' | 'inaktiv' | 'gesperrt'
  aktiv: boolean
}

export const versicherer: Versicherer[] = [
  {
    id: 'vers-001',
    name: 'Allianz Versicherungs-AG',
    kurzname: 'Allianz',
    typ: 'erstversicherer',
    spezialisierung: ['kfz_flotte', 'transport', 'haftpflicht'],
    kontakt: {
      ansprechpartner: 'Dr. Michael Wagner',
      position: 'Leiter Flottengeschäft',
      email: 'm.wagner@allianz.de',
      telefon: '+49 89 3800-1234',
      mobil: '+49 151 1234-5678',
    },
    adresse: {
      strasse: 'Königinstraße 28',
      plz: '80802',
      ort: 'München',
      land: 'Deutschland',
    },
    rating: {
      finanzstaerke: 'A+',
      serviceQualitaet: 1,
      schadenregulierung: 2,
    },
    partnerSeit: '2018-01-15',
    rahmenvertragsNr: 'RV-ALZ-2024-001',
    provision: 12,
    zahlungsziel: 30,
    status: 'aktiv',
    aktiv: true,
  },
  {
    id: 'vers-002',
    name: 'AXA Versicherung AG',
    kurzname: 'AXA',
    typ: 'erstversicherer',
    spezialisierung: ['kfz_flotte', 'gewerbe', 'haftpflicht'],
    kontakt: {
      ansprechpartner: 'Sandra Becker',
      position: 'Senior Underwriter Flotten',
      email: 's.becker@axa.de',
      telefon: '+49 221 148-2500',
      mobil: '+49 172 8765-4321',
    },
    adresse: {
      strasse: 'Colonia-Allee 10-20',
      plz: '51067',
      ort: 'Köln',
      land: 'Deutschland',
    },
    rating: {
      finanzstaerke: 'A+',
      serviceQualitaet: 2,
      schadenregulierung: 1,
    },
    partnerSeit: '2019-06-01',
    rahmenvertragsNr: 'RV-AXA-2024-003',
    provision: 11.5,
    zahlungsziel: 30,
    status: 'aktiv',
    aktiv: true,
  },
  {
    id: 'vers-003',
    name: 'HDI Versicherung AG',
    kurzname: 'HDI',
    typ: 'erstversicherer',
    spezialisierung: ['kfz_flotte', 'industrie', 'logistik'],
    kontakt: {
      ansprechpartner: 'Thomas Schneider',
      position: 'Vertriebsleiter Flottenversicherung',
      email: 't.schneider@hdi.de',
      telefon: '+49 511 645-1500',
      mobil: '+49 160 9876-5432',
    },
    adresse: {
      strasse: 'HDI-Platz 1',
      plz: '30659',
      ort: 'Hannover',
      land: 'Deutschland',
    },
    rating: {
      finanzstaerke: 'A',
      serviceQualitaet: 2,
      schadenregulierung: 2,
    },
    partnerSeit: '2017-03-20',
    rahmenvertragsNr: 'RV-HDI-2024-007',
    provision: 10,
    zahlungsziel: 45,
    status: 'aktiv',
    aktiv: true,
  },
  {
    id: 'vers-004',
    name: 'Zurich Versicherung',
    kurzname: 'Zurich',
    typ: 'erstversicherer',
    spezialisierung: ['kfz_flotte', 'premium', 'telematik'],
    kontakt: {
      ansprechpartner: 'Julia Hofmann',
      position: 'Head of Fleet Solutions',
      email: 'j.hofmann@zurich.de',
      telefon: '+49 69 667-4200',
      mobil: '+49 151 2345-6789',
    },
    adresse: {
      strasse: 'Deutzer Allee 1',
      plz: '50679',
      ort: 'Köln',
      land: 'Deutschland',
    },
    rating: {
      finanzstaerke: 'A+',
      serviceQualitaet: 1,
      schadenregulierung: 1,
    },
    partnerSeit: '2020-01-10',
    rahmenvertragsNr: 'RV-ZUR-2024-002',
    provision: 13,
    zahlungsziel: 30,
    status: 'aktiv',
    aktiv: true,
  },
  {
    id: 'vers-005',
    name: 'R+V Versicherung AG',
    kurzname: 'R+V',
    typ: 'erstversicherer',
    spezialisierung: ['kfz_flotte', 'landwirtschaft', 'gewerbe'],
    kontakt: {
      ansprechpartner: 'Martin Keller',
      position: 'Sachbearbeiter Flotten',
      email: 'm.keller@ruv.de',
      telefon: '+49 611 533-2000',
      mobil: '+49 172 6543-2109',
    },
    adresse: {
      strasse: 'Raiffeisenplatz 1',
      plz: '65189',
      ort: 'Wiesbaden',
      land: 'Deutschland',
    },
    rating: {
      finanzstaerke: 'A',
      serviceQualitaet: 3,
      schadenregulierung: 3,
    },
    partnerSeit: '2016-09-15',
    rahmenvertragsNr: 'RV-RUV-2024-005',
    provision: 9.5,
    zahlungsziel: 45,
    status: 'aktiv',
    aktiv: true,
  },
]

// Hilfsfunktion: Aktive Versicherer abrufen
export function getAktiveVersicherer(): Versicherer[] {
  return versicherer.filter((v) => v.status === 'aktiv' && v.aktiv)
}

// Hilfsfunktion: Versicherer nach Spezialisierung filtern
export function getVersichererNachSpezialisierung(spezialisierung: string): Versicherer[] {
  return versicherer.filter(
    (v) => v.status === 'aktiv' && v.spezialisierung.includes(spezialisierung)
  )
}
