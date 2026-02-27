/**
 * Musterfirma GmbH - Stammdaten
 * Konsistenter Beispielkunde für alle drei Apps (Makler, Assekuradeur, Versicherer)
 */

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
  bankverbindung: {
    iban: string
    bic: string
    bank: string
  }
  status: 'aktiv' | 'inaktiv' | 'neu'
  erstelltAm: string
  aktualisiertAm: string
}

export const musterfirmaKunde: Kunde = {
  id: 'kunde-001',
  firmenname: 'Musterfirma GmbH',
  rechtsform: 'GmbH',
  branche: 'Logistik & Transport',
  strasse: 'Industriestraße 42',
  plz: '76131',
  ort: 'Karlsruhe',
  land: 'Deutschland',
  telefon: '+49 721 1234567',
  fax: '+49 721 1234568',
  email: 'info@musterfirma.de',
  website: 'www.musterfirma.de',
  ansprechpartner: 'Max Mustermann',
  ansprechpartnerPosition: 'Geschäftsführer',
  ansprechpartnerTelefon: '+49 721 1234567-10',
  ansprechpartnerEmail: 'max.mustermann@musterfirma.de',
  ustIdNr: 'DE123456789',
  handelsregister: 'HRB 12345',
  amtsgericht: 'Karlsruhe',
  gruendungsjahr: 1998,
  anzahlMitarbeiter: 85,
  jahresumsatz: 12500000,
  bankverbindung: {
    iban: 'DE89 3704 0044 0532 0130 00',
    bic: 'COBADEFFXXX',
    bank: 'Commerzbank Karlsruhe',
  },
  status: 'aktiv',
  erstelltAm: '2020-03-15',
  aktualisiertAm: '2025-11-20',
}

// Weitere Beispielkunden für die Demo
export const weitereKunden: Kunde[] = [
  {
    id: 'kunde-002',
    firmenname: 'Logistik Schmidt GmbH',
    rechtsform: 'GmbH',
    branche: 'Spedition',
    strasse: 'Hafenstraße 15',
    plz: '68159',
    ort: 'Mannheim',
    land: 'Deutschland',
    telefon: '+49 621 9876543',
    email: 'info@logistik-schmidt.de',
    ansprechpartner: 'Hans Schmidt',
    ansprechpartnerPosition: 'Geschäftsführer',
    ansprechpartnerTelefon: '+49 621 9876543-10',
    ansprechpartnerEmail: 'h.schmidt@logistik-schmidt.de',
    ustIdNr: 'DE987654321',
    handelsregister: 'HRB 54321',
    amtsgericht: 'Mannheim',
    gruendungsjahr: 2005,
    anzahlMitarbeiter: 45,
    jahresumsatz: 8500000,
    bankverbindung: {
      iban: 'DE91 1234 5678 9012 3456 78',
      bic: 'DEUTDEDBMAN',
      bank: 'Deutsche Bank Mannheim',
    },
    status: 'aktiv',
    erstelltAm: '2021-06-10',
    aktualisiertAm: '2025-08-15',
  },
  {
    id: 'kunde-003',
    firmenname: 'Transport Meyer AG',
    rechtsform: 'AG',
    branche: 'Transport',
    strasse: 'Autobahn-Zentrum 8',
    plz: '70173',
    ort: 'Stuttgart',
    land: 'Deutschland',
    telefon: '+49 711 5551234',
    email: 'kontakt@transport-meyer.de',
    ansprechpartner: 'Franz Meyer',
    ansprechpartnerPosition: 'Vorstand',
    ansprechpartnerTelefon: '+49 711 5551234-100',
    ansprechpartnerEmail: 'f.meyer@transport-meyer.de',
    ustIdNr: 'DE555123456',
    handelsregister: 'HRB 99999',
    amtsgericht: 'Stuttgart',
    gruendungsjahr: 1985,
    anzahlMitarbeiter: 120,
    jahresumsatz: 25000000,
    bankverbindung: {
      iban: 'DE55 6005 0101 0012 3456 78',
      bic: 'SOLADEST600',
      bank: 'BW Bank Stuttgart',
    },
    status: 'aktiv',
    erstelltAm: '2019-01-20',
    aktualisiertAm: '2025-12-01',
  },
  {
    id: 'kunde-004',
    firmenname: 'Spedition Bauer KG',
    rechtsform: 'KG',
    branche: 'Spedition',
    strasse: 'Logistikpark 3',
    plz: '79098',
    ort: 'Freiburg',
    land: 'Deutschland',
    telefon: '+49 761 4443210',
    email: 'info@spedition-bauer.de',
    ansprechpartner: 'Klaus Bauer',
    ansprechpartnerPosition: 'Komplementär',
    ansprechpartnerTelefon: '+49 761 4443210-20',
    ansprechpartnerEmail: 'k.bauer@spedition-bauer.de',
    ustIdNr: 'DE444321098',
    handelsregister: 'HRA 77777',
    amtsgericht: 'Freiburg',
    gruendungsjahr: 2010,
    anzahlMitarbeiter: 38,
    jahresumsatz: 6200000,
    bankverbindung: {
      iban: 'DE44 6809 0000 0012 3456 78',
      bic: 'GENODE61FR1',
      bank: 'Volksbank Freiburg',
    },
    status: 'aktiv',
    erstelltAm: '2022-04-05',
    aktualisiertAm: '2025-09-30',
  },
  {
    id: 'kunde-005',
    firmenname: 'Kurier Express GmbH',
    rechtsform: 'GmbH',
    branche: 'Kurierdienst',
    strasse: 'Schnellweg 99',
    plz: '69115',
    ort: 'Heidelberg',
    land: 'Deutschland',
    telefon: '+49 6221 7778899',
    email: 'service@kurier-express.de',
    ansprechpartner: 'Maria Weber',
    ansprechpartnerPosition: 'Geschäftsführerin',
    ansprechpartnerTelefon: '+49 6221 7778899-15',
    ansprechpartnerEmail: 'm.weber@kurier-express.de',
    ustIdNr: 'DE777889900',
    handelsregister: 'HRB 33333',
    amtsgericht: 'Heidelberg',
    gruendungsjahr: 2015,
    anzahlMitarbeiter: 23,
    jahresumsatz: 3800000,
    bankverbindung: {
      iban: 'DE77 6729 0000 0012 3456 78',
      bic: 'GENODE61HD1',
      bank: 'Volksbank Heidelberg',
    },
    status: 'aktiv',
    erstelltAm: '2023-02-28',
    aktualisiertAm: '2025-10-15',
  },
]

// Alle Kunden zusammen
export const alleKunden: Kunde[] = [musterfirmaKunde, ...weitereKunden]

// Helper: Kunde nach ID finden
export function getKundeById(id: string): Kunde | undefined {
  return alleKunden.find((k) => k.id === id)
}

// Helper: Kunden nach Status filtern
export function getKundenByStatus(status: Kunde['status']): Kunde[] {
  return alleKunden.filter((k) => k.status === status)
}
