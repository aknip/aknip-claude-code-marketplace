/**
 * Anfragen-Daten für die KFZ-Flottenversicherung Demo
 * Workflow: Makler → Assekuradeur → Versicherer
 */

import { musterfirmaKunde, weitereKunden, type Kunde } from './musterfirma'

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

export interface WorkflowSchritt {
  schritt: string
  status: 'abgeschlossen' | 'aktuell' | 'offen'
  bearbeiter?: string
  datum?: string
  notizen?: string
}

export interface Dokument {
  id: string
  name: string
  typ: 'fuhrparkliste' | 'schadenverlauf' | 'vertrag' | 'angebot' | 'deckungsbestaetigung' | 'sonstiges'
  datum: string
  groesse?: string
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
  makler: {
    name: string
    email: string
    telefon: string
    unternehmen: string
  }
  assekuradeur?: {
    sachbearbeiter: string
    email: string
  }
  versicherer?: {
    name: string
    ansprechpartner?: string
  }

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

// Anfragen für Musterfirma und andere Kunden
export const anfragen: Anfrage[] = [
  // Anfrage 1: Musterfirma GmbH - Hauptanfrage (fast abgeschlossen)
  {
    id: 'anf-001',
    anfrageNummer: 'ANF-2024-0001',
    kundeId: 'kunde-001',
    kunde: musterfirmaKunde,
    produkttyp: 'kfz_flotte',
    status: 'vertrag_aktiv',
    dringlichkeit: 'normal',
    versicherungsbeginn: '2024-01-01',
    laufzeit: 12,
    anzahlFahrzeuge: 62,
    gesamtPraemie: 118500,
    workflow: [
      { schritt: 'Kunde & Flotte', status: 'abgeschlossen', bearbeiter: 'Hr. Mustermann', datum: '2023-10-15', notizen: 'Vollständige Flottendaten eingereicht' },
      { schritt: 'Schadenverlauf', status: 'abgeschlossen', bearbeiter: 'Hr. Mustermann', datum: '2023-10-18', notizen: 'ESA für 5 Jahre hochgeladen' },
      { schritt: 'Deckungsanfrage', status: 'abgeschlossen', bearbeiter: 'Fr. Schneider', datum: '2023-10-25', notizen: 'An Gothaer, HDI, Allianz' },
      { schritt: 'Deckung', status: 'abgeschlossen', bearbeiter: 'Fr. Schneider', datum: '2023-11-08', notizen: 'Gothaer hat bestes Angebot' },
      { schritt: 'Angebot', status: 'abgeschlossen', bearbeiter: 'Hr. Weber', datum: '2023-11-15', notizen: 'Angebot an Kunden versandt' },
      { schritt: 'Vertrag', status: 'abgeschlossen', bearbeiter: 'Hr. Weber', datum: '2023-12-01', notizen: 'Vertrag abgeschlossen' },
    ],
    aktuellerSchritt: 6,
    makler: {
      name: 'Thomas Müller',
      email: 't.mueller@howden.de',
      telefon: '+49 721 98765-100',
      unternehmen: 'HOWDEN AG',
    },
    assekuradeur: {
      sachbearbeiter: 'Frau Schneider',
      email: 's.schneider@mrc-assekuradeur.de',
    },
    versicherer: {
      name: 'Gothaer Versicherung',
      ansprechpartner: 'Herr Bergmann',
    },
    dokumente: [
      { id: 'doc-001', name: 'Fuhrparkliste_Musterfirma_2024.xlsx', typ: 'fuhrparkliste', datum: '2023-10-15', groesse: '245 KB' },
      { id: 'doc-002', name: 'ESA_2019-2023.pdf', typ: 'schadenverlauf', datum: '2023-10-18', groesse: '1.2 MB' },
      { id: 'doc-003', name: 'Angebot_Gothaer_2024.pdf', typ: 'angebot', datum: '2023-11-08', groesse: '890 KB' },
      { id: 'doc-004', name: 'Flottenvertrag_2024.pdf', typ: 'vertrag', datum: '2023-12-01', groesse: '2.1 MB' },
      { id: 'doc-005', name: 'Deckungsbestaetigung.pdf', typ: 'deckungsbestaetigung', datum: '2023-12-15', groesse: '156 KB' },
    ],
    erstelltAm: '2023-10-15',
    aktualisiertAm: '2023-12-15',
    eingereichtAm: '2023-10-18',
    interneNotizen: 'Bestandskunde seit 2019. Gute Schadenentwicklung. Vertrag verlängert zu verbesserten Konditionen.',
    kundenwuensche: 'Vollkasko für alle Fahrzeuge, Selbstbeteiligung max. €1.000',
    besonderheiten: 'Gemischte Flotte (PKW, Transporter, LKW). E-Fahrzeuge im Bestand.',
  },

  // Anfrage 2: Musterfirma - Erweiterung (neu eingereicht)
  {
    id: 'anf-002',
    anfrageNummer: 'ANF-2025-0001',
    kundeId: 'kunde-001',
    kunde: musterfirmaKunde,
    produkttyp: 'kfz_flotte',
    status: 'in_pruefung',
    dringlichkeit: 'hoch',
    versicherungsbeginn: '2025-02-01',
    laufzeit: 12,
    anzahlFahrzeuge: 5,
    workflow: [
      { schritt: 'Kunde & Flotte', status: 'abgeschlossen', bearbeiter: 'Hr. Müller', datum: '2025-01-10', notizen: '5 neue Fahrzeuge für Flottenerweiterung' },
      { schritt: 'Schadenverlauf', status: 'abgeschlossen', bearbeiter: 'Hr. Müller', datum: '2025-01-10', notizen: 'Bestehender Vertrag, keine neue ESA erforderlich' },
      { schritt: 'Deckungsanfrage', status: 'aktuell', bearbeiter: 'Fr. Schneider', notizen: 'Nachtrag zum bestehenden Vertrag' },
      { schritt: 'Deckung', status: 'offen' },
      { schritt: 'Angebot', status: 'offen' },
      { schritt: 'Vertrag', status: 'offen' },
    ],
    aktuellerSchritt: 3,
    makler: {
      name: 'Thomas Müller',
      email: 't.mueller@howden.de',
      telefon: '+49 721 98765-100',
      unternehmen: 'HOWDEN AG',
    },
    assekuradeur: {
      sachbearbeiter: 'Frau Schneider',
      email: 's.schneider@mrc-assekuradeur.de',
    },
    dokumente: [
      { id: 'doc-006', name: 'Nachtrag_Fuhrparkliste_2025.xlsx', typ: 'fuhrparkliste', datum: '2025-01-10', groesse: '45 KB' },
    ],
    erstelltAm: '2025-01-10',
    aktualisiertAm: '2025-01-15',
    eingereichtAm: '2025-01-10',
    interneNotizen: 'Erweiterung bestehender Flotte um 5 neue E-Transporter.',
    kundenwuensche: 'Gleiche Konditionen wie Hauptvertrag',
    besonderheiten: '5 neue Mercedes eSprinter für Innenstadtlieferung',
  },

  // Anfrage 3: Logistik Schmidt GmbH (in Bearbeitung)
  {
    id: 'anf-003',
    anfrageNummer: 'ANF-2025-0002',
    kundeId: 'kunde-002',
    kunde: weitereKunden[0],
    produkttyp: 'kfz_flotte',
    status: 'deckungsanfrage',
    dringlichkeit: 'normal',
    versicherungsbeginn: '2025-03-01',
    laufzeit: 12,
    anzahlFahrzeuge: 28,
    workflow: [
      { schritt: 'Kunde & Flotte', status: 'abgeschlossen', bearbeiter: 'Fr. Weber', datum: '2025-01-05', notizen: 'Neukunde, Flottendaten vollständig' },
      { schritt: 'Schadenverlauf', status: 'abgeschlossen', bearbeiter: 'Fr. Weber', datum: '2025-01-08', notizen: 'ESA von Vorversicherer erhalten' },
      { schritt: 'Deckungsanfrage', status: 'abgeschlossen', bearbeiter: 'Hr. Fischer', datum: '2025-01-12', notizen: 'Anfrage an 4 Versicherer' },
      { schritt: 'Deckung', status: 'aktuell', notizen: 'Warte auf Rückmeldungen' },
      { schritt: 'Angebot', status: 'offen' },
      { schritt: 'Vertrag', status: 'offen' },
    ],
    aktuellerSchritt: 4,
    makler: {
      name: 'Sandra Weber',
      email: 's.weber@howden.de',
      telefon: '+49 721 98765-102',
      unternehmen: 'HOWDEN AG',
    },
    assekuradeur: {
      sachbearbeiter: 'Herr Fischer',
      email: 'h.fischer@mrc-assekuradeur.de',
    },
    dokumente: [
      { id: 'doc-007', name: 'Fuhrparkliste_LogistikSchmidt.xlsx', typ: 'fuhrparkliste', datum: '2025-01-05', groesse: '128 KB' },
      { id: 'doc-008', name: 'ESA_Vorversicherer_2020-2024.pdf', typ: 'schadenverlauf', datum: '2025-01-08', groesse: '890 KB' },
    ],
    erstelltAm: '2025-01-05',
    aktualisiertAm: '2025-01-15',
    eingereichtAm: '2025-01-08',
    angebotBis: '2025-02-15',
    interneNotizen: 'Neukunde, wechselt von DEVK. Gute Schadenhistorie.',
    kundenwuensche: 'Bessere Konditionen als aktueller Versicherer',
    besonderheiten: 'Hauptsächlich Transporter für Nahverkehr',
  },

  // Anfrage 4: Transport Meyer AG (Angebot erstellt)
  {
    id: 'anf-004',
    anfrageNummer: 'ANF-2025-0003',
    kundeId: 'kunde-003',
    kunde: weitereKunden[1],
    produkttyp: 'kfz_flotte',
    status: 'angebot_erstellt',
    dringlichkeit: 'hoch',
    versicherungsbeginn: '2025-02-15',
    laufzeit: 24,
    anzahlFahrzeuge: 85,
    gesamtPraemie: 245000,
    workflow: [
      { schritt: 'Kunde & Flotte', status: 'abgeschlossen', bearbeiter: 'Hr. Müller', datum: '2024-12-10', notizen: 'Große Flotte, umfangreiche Dokumentation' },
      { schritt: 'Schadenverlauf', status: 'abgeschlossen', bearbeiter: 'Hr. Müller', datum: '2024-12-15', notizen: 'ESA zeigt hohe Schadenhäufigkeit bei LKW' },
      { schritt: 'Deckungsanfrage', status: 'abgeschlossen', bearbeiter: 'Fr. Hoffmann', datum: '2024-12-20', notizen: 'Spezialanfrage für Schwerverkehr' },
      { schritt: 'Deckung', status: 'abgeschlossen', bearbeiter: 'Fr. Hoffmann', datum: '2025-01-08', notizen: 'HDI und Kravag haben Angebote abgegeben' },
      { schritt: 'Angebot', status: 'aktuell', bearbeiter: 'Hr. Weber', datum: '2025-01-12', notizen: 'Angebot versandt, Entscheidung ausstehend' },
      { schritt: 'Vertrag', status: 'offen' },
    ],
    aktuellerSchritt: 5,
    makler: {
      name: 'Thomas Müller',
      email: 't.mueller@howden.de',
      telefon: '+49 721 98765-100',
      unternehmen: 'HOWDEN AG',
    },
    assekuradeur: {
      sachbearbeiter: 'Frau Hoffmann',
      email: 'm.hoffmann@mrc-assekuradeur.de',
    },
    versicherer: {
      name: 'HDI Versicherung',
      ansprechpartner: 'Frau Dr. Klein',
    },
    dokumente: [
      { id: 'doc-009', name: 'Fuhrparkliste_TransportMeyer.xlsx', typ: 'fuhrparkliste', datum: '2024-12-10', groesse: '456 KB' },
      { id: 'doc-010', name: 'ESA_2019-2024.pdf', typ: 'schadenverlauf', datum: '2024-12-15', groesse: '2.3 MB' },
      { id: 'doc-011', name: 'Angebot_HDI_2025.pdf', typ: 'angebot', datum: '2025-01-12', groesse: '1.1 MB' },
    ],
    erstelltAm: '2024-12-10',
    aktualisiertAm: '2025-01-12',
    eingereichtAm: '2024-12-15',
    angebotBis: '2025-01-31',
    interneNotizen: 'Großkunde mit komplexer Flotte. Erhöhte SB bei LKW wegen Schadenhistorie.',
    kundenwuensche: '24-Monate-Vertrag, Prämienstabilität',
    besonderheiten: '40 LKW, 30 Sattelzüge, 15 PKW. Fernverkehr Deutschland + Europa.',
  },

  // Anfrage 5: Spedition Bauer KG (Rückfrage)
  {
    id: 'anf-005',
    anfrageNummer: 'ANF-2025-0004',
    kundeId: 'kunde-004',
    kunde: weitereKunden[2],
    produkttyp: 'kfz_flotte',
    status: 'rueckfrage',
    dringlichkeit: 'normal',
    versicherungsbeginn: '2025-04-01',
    laufzeit: 12,
    anzahlFahrzeuge: 22,
    workflow: [
      { schritt: 'Kunde & Flotte', status: 'abgeschlossen', bearbeiter: 'Fr. Weber', datum: '2025-01-08' },
      { schritt: 'Schadenverlauf', status: 'aktuell', notizen: 'ESA fehlt noch - Rückfrage an Makler' },
      { schritt: 'Deckungsanfrage', status: 'offen' },
      { schritt: 'Deckung', status: 'offen' },
      { schritt: 'Angebot', status: 'offen' },
      { schritt: 'Vertrag', status: 'offen' },
    ],
    aktuellerSchritt: 2,
    makler: {
      name: 'Sandra Weber',
      email: 's.weber@howden.de',
      telefon: '+49 721 98765-102',
      unternehmen: 'HOWDEN AG',
    },
    assekuradeur: {
      sachbearbeiter: 'Frau Klein',
      email: 'k.klein@mrc-assekuradeur.de',
    },
    dokumente: [
      { id: 'doc-012', name: 'Fuhrparkliste_SpeditionBauer.xlsx', typ: 'fuhrparkliste', datum: '2025-01-08', groesse: '89 KB' },
    ],
    erstelltAm: '2025-01-08',
    aktualisiertAm: '2025-01-16',
    eingereichtAm: '2025-01-08',
    interneNotizen: 'Warte auf ESA vom Vorversicherer. Kunde hat diese angefordert.',
    kundenwuensche: 'Günstige Prämie, flexibler Vertrag',
    besonderheiten: 'Regionaler Spediteur, hauptsächlich Nahverkehr',
  },

  // Anfrage 6: Kurier Express GmbH (Entwurf)
  {
    id: 'anf-006',
    anfrageNummer: 'ANF-2025-0005',
    kundeId: 'kunde-005',
    kunde: weitereKunden[3],
    produkttyp: 'kfz_flotte',
    status: 'entwurf',
    dringlichkeit: 'niedrig',
    versicherungsbeginn: '2025-05-01',
    laufzeit: 12,
    anzahlFahrzeuge: 15,
    workflow: [
      { schritt: 'Kunde & Flotte', status: 'aktuell', notizen: 'Flottendaten werden noch erfasst' },
      { schritt: 'Schadenverlauf', status: 'offen' },
      { schritt: 'Deckungsanfrage', status: 'offen' },
      { schritt: 'Deckung', status: 'offen' },
      { schritt: 'Angebot', status: 'offen' },
      { schritt: 'Vertrag', status: 'offen' },
    ],
    aktuellerSchritt: 1,
    makler: {
      name: 'Michael Schmidt',
      email: 'm.schmidt@howden.de',
      telefon: '+49 721 98765-105',
      unternehmen: 'HOWDEN AG',
    },
    dokumente: [],
    erstelltAm: '2025-01-15',
    aktualisiertAm: '2025-01-15',
    kundenwuensche: 'Schnelle Bearbeitung, Versicherungsschutz für neue Fahrzeuge',
    besonderheiten: 'Kurierdienst mit hoher Kilometerleistung',
  },

  // Anfrage 7: Abgelehnte Anfrage (historisch)
  {
    id: 'anf-007',
    anfrageNummer: 'ANF-2024-0015',
    kundeId: 'kunde-ext-001',
    kunde: {
      id: 'kunde-ext-001',
      firmenname: 'Risiko Transport GmbH',
      rechtsform: 'GmbH',
      branche: 'Gefahrguttransport',
      strasse: 'Chemiestraße 1',
      plz: '68199',
      ort: 'Mannheim',
      land: 'Deutschland',
      telefon: '+49 621 5551234',
      email: 'info@risiko-transport.de',
      ansprechpartner: 'Karl Riskant',
      ansprechpartnerPosition: 'Geschäftsführer',
      ansprechpartnerTelefon: '+49 621 5551234-10',
      ansprechpartnerEmail: 'k.riskant@risiko-transport.de',
      ustIdNr: 'DE111222333',
      handelsregister: 'HRB 11111',
      amtsgericht: 'Mannheim',
      gruendungsjahr: 2018,
      anzahlMitarbeiter: 15,
      jahresumsatz: 2500000,
      bankverbindung: {
        iban: 'DE11 6700 0000 0012 3456 78',
        bic: 'DEUTDEDB670',
        bank: 'Deutsche Bank Mannheim',
      },
      status: 'aktiv',
      erstelltAm: '2024-06-01',
      aktualisiertAm: '2024-08-15',
    },
    produkttyp: 'kfz_flotte',
    status: 'abgelehnt',
    dringlichkeit: 'normal',
    versicherungsbeginn: '2024-09-01',
    laufzeit: 12,
    anzahlFahrzeuge: 8,
    workflow: [
      { schritt: 'Kunde & Flotte', status: 'abgeschlossen', bearbeiter: 'Hr. Müller', datum: '2024-06-01' },
      { schritt: 'Schadenverlauf', status: 'abgeschlossen', bearbeiter: 'Hr. Müller', datum: '2024-06-05', notizen: 'Sehr hohe Schadenquote (180%)' },
      { schritt: 'Deckungsanfrage', status: 'abgeschlossen', bearbeiter: 'Fr. Schneider', datum: '2024-06-15' },
      { schritt: 'Deckung', status: 'abgeschlossen', datum: '2024-07-01', notizen: 'Alle Versicherer haben abgelehnt' },
      { schritt: 'Angebot', status: 'abgeschlossen', notizen: 'Kein Angebot möglich' },
      { schritt: 'Vertrag', status: 'abgeschlossen', notizen: 'Anfrage abgelehnt' },
    ],
    aktuellerSchritt: 6,
    makler: {
      name: 'Thomas Müller',
      email: 't.mueller@howden.de',
      telefon: '+49 721 98765-100',
      unternehmen: 'HOWDEN AG',
    },
    assekuradeur: {
      sachbearbeiter: 'Frau Schneider',
      email: 's.schneider@mrc-assekuradeur.de',
    },
    dokumente: [
      { id: 'doc-013', name: 'Fuhrparkliste_RisikoTransport.xlsx', typ: 'fuhrparkliste', datum: '2024-06-01', groesse: '34 KB' },
      { id: 'doc-014', name: 'ESA_Katastrophal.pdf', typ: 'schadenverlauf', datum: '2024-06-05', groesse: '567 KB' },
    ],
    erstelltAm: '2024-06-01',
    aktualisiertAm: '2024-07-15',
    eingereichtAm: '2024-06-05',
    interneNotizen: 'Gefahrguttransport mit extrem hoher Schadenquote. KO-Kriterien erfüllt. Ablehnung durch alle angefragten Versicherer.',
    besonderheiten: 'Gefahrguttransport, 3 Totalschäden in 2 Jahren',
  },

  // Anfrage 8: Nachverhandlung
  {
    id: 'anf-008',
    anfrageNummer: 'ANF-2025-0006',
    kundeId: 'kunde-ext-002',
    kunde: {
      id: 'kunde-ext-002',
      firmenname: 'Express Logistik AG',
      rechtsform: 'AG',
      branche: 'Express-Logistik',
      strasse: 'Schnellstraße 50',
      plz: '75172',
      ort: 'Pforzheim',
      land: 'Deutschland',
      telefon: '+49 7231 9999000',
      email: 'info@express-logistik.de',
      ansprechpartner: 'Dr. Schnell',
      ansprechpartnerPosition: 'Vorstand',
      ansprechpartnerTelefon: '+49 7231 9999001',
      ansprechpartnerEmail: 'dr.schnell@express-logistik.de',
      ustIdNr: 'DE999888777',
      handelsregister: 'HRB 88888',
      amtsgericht: 'Pforzheim',
      gruendungsjahr: 2010,
      anzahlMitarbeiter: 180,
      jahresumsatz: 35000000,
      bankverbindung: {
        iban: 'DE99 6665 0085 0012 3456 78',
        bic: 'PZHSDE66XXX',
        bank: 'Sparkasse Pforzheim',
      },
      status: 'aktiv',
      erstelltAm: '2024-11-01',
      aktualisiertAm: '2025-01-10',
    },
    produkttyp: 'kfz_flotte',
    status: 'nachverhandlung',
    dringlichkeit: 'dringend',
    versicherungsbeginn: '2025-02-01',
    laufzeit: 36,
    anzahlFahrzeuge: 120,
    gesamtPraemie: 380000,
    workflow: [
      { schritt: 'Kunde & Flotte', status: 'abgeschlossen', bearbeiter: 'Hr. Müller', datum: '2024-11-01' },
      { schritt: 'Schadenverlauf', status: 'abgeschlossen', bearbeiter: 'Hr. Müller', datum: '2024-11-05' },
      { schritt: 'Deckungsanfrage', status: 'abgeschlossen', bearbeiter: 'Fr. Hoffmann', datum: '2024-11-15' },
      { schritt: 'Deckung', status: 'abgeschlossen', bearbeiter: 'Fr. Hoffmann', datum: '2024-12-10' },
      { schritt: 'Angebot', status: 'aktuell', bearbeiter: 'Hr. Weber', datum: '2024-12-20', notizen: 'Kunde wünscht Nachverhandlung der Prämie' },
      { schritt: 'Vertrag', status: 'offen' },
    ],
    aktuellerSchritt: 5,
    makler: {
      name: 'Thomas Müller',
      email: 't.mueller@howden.de',
      telefon: '+49 721 98765-100',
      unternehmen: 'HOWDEN AG',
    },
    assekuradeur: {
      sachbearbeiter: 'Frau Hoffmann',
      email: 'm.hoffmann@mrc-assekuradeur.de',
    },
    versicherer: {
      name: 'Allianz',
      ansprechpartner: 'Herr Dr. Groß',
    },
    dokumente: [
      { id: 'doc-015', name: 'Fuhrparkliste_ExpressLogistik.xlsx', typ: 'fuhrparkliste', datum: '2024-11-01', groesse: '678 KB' },
      { id: 'doc-016', name: 'ESA_2019-2024.pdf', typ: 'schadenverlauf', datum: '2024-11-05', groesse: '3.2 MB' },
      { id: 'doc-017', name: 'Angebot_Allianz_v1.pdf', typ: 'angebot', datum: '2024-12-20', groesse: '1.5 MB' },
    ],
    erstelltAm: '2024-11-01',
    aktualisiertAm: '2025-01-15',
    eingereichtAm: '2024-11-05',
    angebotBis: '2025-01-25',
    interneNotizen: 'Großkunde mit Potenzial. Kunde möchte 10% Prämienreduktion. Versicherer prüft Gegenangebot.',
    kundenwuensche: 'Langlaufender Vertrag mit Prämienstabilität, Mengenrabatt',
    besonderheiten: 'Große Flotte, hauptsächlich Transporter und leichte LKW. Expresslieferungen.',
  },

  // Anfrage 9-18: Zusätzliche Anfragen für erweiterte Tabelle
  {
    id: 'anf-009',
    anfrageNummer: 'ANF-2025-0007',
    kundeId: 'kunde-002',
    kunde: weitereKunden[0],
    produkttyp: 'kfz_flotte',
    status: 'in_pruefung',
    dringlichkeit: 'normal',
    versicherungsbeginn: '2025-03-15',
    laufzeit: 12,
    anzahlFahrzeuge: 18,
    workflow: [
      { schritt: 'Kunde & Flotte', status: 'abgeschlossen', bearbeiter: 'Fr. Weber', datum: '2025-01-12' },
      { schritt: 'Schadenverlauf', status: 'abgeschlossen', bearbeiter: 'Fr. Weber', datum: '2025-01-14' },
      { schritt: 'Deckungsanfrage', status: 'aktuell', bearbeiter: 'Hr. Fischer', notizen: 'Prüfung läuft' },
      { schritt: 'Deckung', status: 'offen' },
      { schritt: 'Angebot', status: 'offen' },
      { schritt: 'Vertrag', status: 'offen' },
    ],
    aktuellerSchritt: 3,
    makler: {
      name: 'Sandra Weber',
      email: 's.weber@howden.de',
      telefon: '+49 721 98765-102',
      unternehmen: 'HOWDEN AG',
    },
    assekuradeur: {
      sachbearbeiter: 'Herr Fischer',
      email: 'h.fischer@mrc-assekuradeur.de',
    },
    dokumente: [],
    erstelltAm: '2025-01-12',
    aktualisiertAm: '2025-01-16',
    eingereichtAm: '2025-01-14',
  },
  {
    id: 'anf-010',
    anfrageNummer: 'ANF-2025-0008',
    kundeId: 'kunde-ext-004',
    kunde: {
      id: 'kunde-ext-004',
      firmenname: 'Stadtwerke Transport GmbH',
      rechtsform: 'GmbH',
      branche: 'Kommunaler Transport',
      strasse: 'Hauptstraße 100',
      plz: '76133',
      ort: 'Karlsruhe',
      land: 'Deutschland',
      telefon: '+49 721 6000-0',
      email: 'info@stadtwerke-ka-transport.de',
      ansprechpartner: 'Herr Kommunal',
      ansprechpartnerPosition: 'Fuhrparkleiter',
      ansprechpartnerTelefon: '+49 721 6000-500',
      ansprechpartnerEmail: 'kommunal@stadtwerke-ka-transport.de',
      ustIdNr: 'DE123456789',
      handelsregister: 'HRB 77777',
      amtsgericht: 'Karlsruhe',
      gruendungsjahr: 2005,
      anzahlMitarbeiter: 45,
      jahresumsatz: 5200000,
      bankverbindung: {
        iban: 'DE12 6605 0101 0012 3456 78',
        bic: 'KARSDE66XXX',
        bank: 'Sparkasse Karlsruhe',
      },
      status: 'aktiv',
      erstelltAm: '2024-12-01',
      aktualisiertAm: '2025-01-10',
    },
    produkttyp: 'kfz_flotte',
    status: 'deckungsanfrage',
    dringlichkeit: 'normal',
    versicherungsbeginn: '2025-04-01',
    laufzeit: 12,
    anzahlFahrzeuge: 32,
    gesamtPraemie: 98000,
    workflow: [
      { schritt: 'Kunde & Flotte', status: 'abgeschlossen', bearbeiter: 'Hr. Schmidt', datum: '2024-12-15' },
      { schritt: 'Schadenverlauf', status: 'abgeschlossen', bearbeiter: 'Hr. Schmidt', datum: '2024-12-20' },
      { schritt: 'Deckungsanfrage', status: 'abgeschlossen', bearbeiter: 'Fr. Klein', datum: '2025-01-05' },
      { schritt: 'Deckung', status: 'aktuell', notizen: 'Warte auf Antworten' },
      { schritt: 'Angebot', status: 'offen' },
      { schritt: 'Vertrag', status: 'offen' },
    ],
    aktuellerSchritt: 4,
    makler: {
      name: 'Michael Schmidt',
      email: 'm.schmidt@howden.de',
      telefon: '+49 721 98765-105',
      unternehmen: 'HOWDEN AG',
    },
    assekuradeur: {
      sachbearbeiter: 'Frau Klein',
      email: 'k.klein@mrc-assekuradeur.de',
    },
    dokumente: [],
    erstelltAm: '2024-12-15',
    aktualisiertAm: '2025-01-16',
    eingereichtAm: '2024-12-20',
  },
  {
    id: 'anf-011',
    anfrageNummer: 'ANF-2025-0009',
    kundeId: 'kunde-003',
    kunde: weitereKunden[1],
    produkttyp: 'kfz_flotte',
    status: 'angebot_erstellt',
    dringlichkeit: 'hoch',
    versicherungsbeginn: '2025-02-20',
    laufzeit: 12,
    anzahlFahrzeuge: 42,
    gesamtPraemie: 156000,
    workflow: [
      { schritt: 'Kunde & Flotte', status: 'abgeschlossen', bearbeiter: 'Hr. Müller', datum: '2024-12-05' },
      { schritt: 'Schadenverlauf', status: 'abgeschlossen', bearbeiter: 'Hr. Müller', datum: '2024-12-08' },
      { schritt: 'Deckungsanfrage', status: 'abgeschlossen', bearbeiter: 'Fr. Schneider', datum: '2024-12-18' },
      { schritt: 'Deckung', status: 'abgeschlossen', bearbeiter: 'Fr. Schneider', datum: '2025-01-05' },
      { schritt: 'Angebot', status: 'aktuell', bearbeiter: 'Hr. Weber', datum: '2025-01-10', notizen: 'Angebot versendet' },
      { schritt: 'Vertrag', status: 'offen' },
    ],
    aktuellerSchritt: 5,
    makler: {
      name: 'Thomas Müller',
      email: 't.mueller@howden.de',
      telefon: '+49 721 98765-100',
      unternehmen: 'HOWDEN AG',
    },
    assekuradeur: {
      sachbearbeiter: 'Frau Schneider',
      email: 's.schneider@mrc-assekuradeur.de',
    },
    dokumente: [],
    erstelltAm: '2024-12-05',
    aktualisiertAm: '2025-01-16',
    eingereichtAm: '2024-12-08',
    angebotBis: '2025-02-05',
  },
  {
    id: 'anf-012',
    anfrageNummer: 'ANF-2025-0010',
    kundeId: 'kunde-004',
    kunde: weitereKunden[2],
    produkttyp: 'kfz_flotte',
    status: 'rueckfrage',
    dringlichkeit: 'hoch',
    versicherungsbeginn: '2025-03-01',
    laufzeit: 12,
    anzahlFahrzeuge: 16,
    workflow: [
      { schritt: 'Kunde & Flotte', status: 'abgeschlossen', bearbeiter: 'Fr. Weber', datum: '2025-01-11' },
      { schritt: 'Schadenverlauf', status: 'aktuell', notizen: 'Unvollständige Angaben - Nachforderung' },
      { schritt: 'Deckungsanfrage', status: 'offen' },
      { schritt: 'Deckung', status: 'offen' },
      { schritt: 'Angebot', status: 'offen' },
      { schritt: 'Vertrag', status: 'offen' },
    ],
    aktuellerSchritt: 2,
    makler: {
      name: 'Sandra Weber',
      email: 's.weber@howden.de',
      telefon: '+49 721 98765-102',
      unternehmen: 'HOWDEN AG',
    },
    assekuradeur: {
      sachbearbeiter: 'Herr Fischer',
      email: 'h.fischer@mrc-assekuradeur.de',
    },
    dokumente: [],
    erstelltAm: '2025-01-11',
    aktualisiertAm: '2025-01-16',
    eingereichtAm: '2025-01-11',
  },
  {
    id: 'anf-013',
    anfrageNummer: 'ANF-2025-0011',
    kundeId: 'kunde-005',
    kunde: weitereKunden[3],
    produkttyp: 'kfz_flotte',
    status: 'in_pruefung',
    dringlichkeit: 'normal',
    versicherungsbeginn: '2025-04-15',
    laufzeit: 12,
    anzahlFahrzeuge: 24,
    workflow: [
      { schritt: 'Kunde & Flotte', status: 'abgeschlossen', bearbeiter: 'Hr. Schmidt', datum: '2025-01-13' },
      { schritt: 'Schadenverlauf', status: 'abgeschlossen', bearbeiter: 'Hr. Schmidt', datum: '2025-01-15' },
      { schritt: 'Deckungsanfrage', status: 'aktuell', bearbeiter: 'Fr. Hoffmann', notizen: 'In Bearbeitung' },
      { schritt: 'Deckung', status: 'offen' },
      { schritt: 'Angebot', status: 'offen' },
      { schritt: 'Vertrag', status: 'offen' },
    ],
    aktuellerSchritt: 3,
    makler: {
      name: 'Michael Schmidt',
      email: 'm.schmidt@howden.de',
      telefon: '+49 721 98765-105',
      unternehmen: 'HOWDEN AG',
    },
    assekuradeur: {
      sachbearbeiter: 'Frau Hoffmann',
      email: 'm.hoffmann@mrc-assekuradeur.de',
    },
    dokumente: [],
    erstelltAm: '2025-01-13',
    aktualisiertAm: '2025-01-16',
    eingereichtAm: '2025-01-15',
  },
  {
    id: 'anf-014',
    anfrageNummer: 'ANF-2025-0012',
    kundeId: 'kunde-001',
    kunde: musterfirmaKunde,
    produkttyp: 'kfz_flotte',
    status: 'deckungsanfrage',
    dringlichkeit: 'normal',
    versicherungsbeginn: '2025-05-01',
    laufzeit: 12,
    anzahlFahrzeuge: 38,
    workflow: [
      { schritt: 'Kunde & Flotte', status: 'abgeschlossen', bearbeiter: 'Hr. Müller', datum: '2025-01-06' },
      { schritt: 'Schadenverlauf', status: 'abgeschlossen', bearbeiter: 'Hr. Müller', datum: '2025-01-09' },
      { schritt: 'Deckungsanfrage', status: 'abgeschlossen', bearbeiter: 'Hr. Fischer', datum: '2025-01-14' },
      { schritt: 'Deckung', status: 'abgeschlossen', bearbeiter: 'Hr. Fischer', datum: '2025-01-15', notizen: 'Deckungen von 3 Versicherern erhalten' },
      { schritt: 'Anfrage', status: 'aktuell', notizen: 'Anfrage wird zusammengestellt' },
      { schritt: 'Vertrag', status: 'offen' },
    ],
    aktuellerSchritt: 5,
    makler: {
      name: 'Thomas Müller',
      email: 't.mueller@howden.de',
      telefon: '+49 721 98765-100',
      unternehmen: 'HOWDEN AG',
    },
    assekuradeur: {
      sachbearbeiter: 'Herr Fischer',
      email: 'h.fischer@mrc-assekuradeur.de',
    },
    dokumente: [],
    erstelltAm: '2025-01-06',
    aktualisiertAm: '2025-01-16',
    eingereichtAm: '2025-01-09',
  },
  {
    id: 'anf-015',
    anfrageNummer: 'ANF-2025-0013',
    kundeId: 'kunde-002',
    kunde: weitereKunden[0],
    produkttyp: 'kfz_flotte',
    status: 'angebot_erstellt',
    dringlichkeit: 'normal',
    versicherungsbeginn: '2025-03-10',
    laufzeit: 12,
    anzahlFahrzeuge: 52,
    gesamtPraemie: 189000,
    workflow: [
      { schritt: 'Kunde & Flotte', status: 'abgeschlossen', bearbeiter: 'Fr. Weber', datum: '2024-12-20' },
      { schritt: 'Schadenverlauf', status: 'abgeschlossen', bearbeiter: 'Fr. Weber', datum: '2024-12-28' },
      { schritt: 'Deckungsanfrage', status: 'abgeschlossen', bearbeiter: 'Fr. Klein', datum: '2025-01-08' },
      { schritt: 'Deckung', status: 'abgeschlossen', bearbeiter: 'Fr. Klein', datum: '2025-01-12' },
      { schritt: 'Angebot', status: 'aktuell', bearbeiter: 'Hr. Weber', datum: '2025-01-15', notizen: 'Kunde prüft Angebot' },
      { schritt: 'Vertrag', status: 'offen' },
    ],
    aktuellerSchritt: 5,
    makler: {
      name: 'Sandra Weber',
      email: 's.weber@howden.de',
      telefon: '+49 721 98765-102',
      unternehmen: 'HOWDEN AG',
    },
    assekuradeur: {
      sachbearbeiter: 'Frau Klein',
      email: 'k.klein@mrc-assekuradeur.de',
    },
    dokumente: [],
    erstelltAm: '2024-12-20',
    aktualisiertAm: '2025-01-16',
    eingereichtAm: '2024-12-28',
    angebotBis: '2025-02-28',
  },
  {
    id: 'anf-016',
    anfrageNummer: 'ANF-2025-0014',
    kundeId: 'kunde-ext-010',
    kunde: {
      id: 'kunde-ext-010',
      firmenname: 'Baustoff Transport GmbH',
      rechtsform: 'GmbH',
      branche: 'Baustofftransport',
      strasse: 'Industrieweg 8',
      plz: '76229',
      ort: 'Karlsruhe',
      land: 'Deutschland',
      telefon: '+49 721 8877000',
      email: 'info@baustoff-transport.de',
      ansprechpartner: 'Herr Beton',
      ansprechpartnerPosition: 'Geschäftsführer',
      ansprechpartnerTelefon: '+49 721 8877001',
      ansprechpartnerEmail: 'beton@baustoff-transport.de',
      ustIdNr: 'DE555666777',
      handelsregister: 'HRB 66666',
      amtsgericht: 'Karlsruhe',
      gruendungsjahr: 2012,
      anzahlMitarbeiter: 28,
      jahresumsatz: 4200000,
      bankverbindung: {
        iban: 'DE55 6665 0085 0012 3456 78',
        bic: 'KARSDE66XXX',
        bank: 'Sparkasse Karlsruhe',
      },
      status: 'aktiv',
      erstelltAm: '2024-11-20',
      aktualisiertAm: '2025-01-05',
    },
    produkttyp: 'kfz_flotte',
    status: 'nachverhandlung',
    dringlichkeit: 'hoch',
    versicherungsbeginn: '2025-02-28',
    laufzeit: 12,
    anzahlFahrzeuge: 19,
    gesamtPraemie: 72000,
    workflow: [
      { schritt: 'Kunde & Flotte', status: 'abgeschlossen', bearbeiter: 'Hr. Schmidt', datum: '2024-11-20' },
      { schritt: 'Schadenverlauf', status: 'abgeschlossen', bearbeiter: 'Hr. Schmidt', datum: '2024-11-25' },
      { schritt: 'Deckungsanfrage', status: 'abgeschlossen', bearbeiter: 'Fr. Hoffmann', datum: '2024-12-10' },
      { schritt: 'Deckung', status: 'abgeschlossen', bearbeiter: 'Fr. Hoffmann', datum: '2024-12-20' },
      { schritt: 'Angebot', status: 'aktuell', bearbeiter: 'Hr. Weber', datum: '2025-01-08', notizen: 'Nachverhandlung zur SB' },
      { schritt: 'Vertrag', status: 'offen' },
    ],
    aktuellerSchritt: 5,
    makler: {
      name: 'Michael Schmidt',
      email: 'm.schmidt@howden.de',
      telefon: '+49 721 98765-105',
      unternehmen: 'HOWDEN AG',
    },
    assekuradeur: {
      sachbearbeiter: 'Frau Hoffmann',
      email: 'm.hoffmann@mrc-assekuradeur.de',
    },
    dokumente: [],
    erstelltAm: '2024-11-20',
    aktualisiertAm: '2025-01-16',
    eingereichtAm: '2024-11-25',
    angebotBis: '2025-02-15',
  },
  {
    id: 'anf-017',
    anfrageNummer: 'ANF-2025-0015',
    kundeId: 'kunde-003',
    kunde: weitereKunden[1],
    produkttyp: 'kfz_flotte',
    status: 'in_pruefung',
    dringlichkeit: 'normal',
    versicherungsbeginn: '2025-06-01',
    laufzeit: 12,
    anzahlFahrzeuge: 8,
    workflow: [
      { schritt: 'Kunde & Flotte', status: 'abgeschlossen', bearbeiter: 'Fr. Weber', datum: '2025-01-14' },
      { schritt: 'Schadenverlauf', status: 'abgeschlossen', bearbeiter: 'Fr. Weber', datum: '2025-01-16' },
      { schritt: 'Deckungsanfrage', status: 'aktuell', bearbeiter: 'Hr. Fischer', notizen: 'Wird geprüft' },
      { schritt: 'Deckung', status: 'offen' },
      { schritt: 'Angebot', status: 'offen' },
      { schritt: 'Vertrag', status: 'offen' },
    ],
    aktuellerSchritt: 3,
    makler: {
      name: 'Sandra Weber',
      email: 's.weber@howden.de',
      telefon: '+49 721 98765-102',
      unternehmen: 'HOWDEN AG',
    },
    assekuradeur: {
      sachbearbeiter: 'Herr Fischer',
      email: 'h.fischer@mrc-assekuradeur.de',
    },
    dokumente: [],
    erstelltAm: '2025-01-14',
    aktualisiertAm: '2025-01-16',
    eingereichtAm: '2025-01-16',
  },
  {
    id: 'anf-018',
    anfrageNummer: 'ANF-2025-0016',
    kundeId: 'kunde-004',
    kunde: weitereKunden[2],
    produkttyp: 'kfz_flotte',
    status: 'angebot_erstellt',
    dringlichkeit: 'normal',
    versicherungsbeginn: '2025-04-01',
    laufzeit: 24,
    anzahlFahrzeuge: 67,
    gesamtPraemie: 285000,
    workflow: [
      { schritt: 'Kunde & Flotte', status: 'abgeschlossen', bearbeiter: 'Hr. Müller', datum: '2024-12-01' },
      { schritt: 'Schadenverlauf', status: 'abgeschlossen', bearbeiter: 'Hr. Müller', datum: '2024-12-05' },
      { schritt: 'Deckungsanfrage', status: 'abgeschlossen', bearbeiter: 'Fr. Schneider', datum: '2024-12-15' },
      { schritt: 'Deckung', status: 'abgeschlossen', bearbeiter: 'Fr. Schneider', datum: '2025-01-03' },
      { schritt: 'Angebot', status: 'aktuell', bearbeiter: 'Hr. Weber', datum: '2025-01-11', notizen: 'Wartet auf Rückmeldung' },
      { schritt: 'Vertrag', status: 'offen' },
    ],
    aktuellerSchritt: 5,
    makler: {
      name: 'Thomas Müller',
      email: 't.mueller@howden.de',
      telefon: '+49 721 98765-100',
      unternehmen: 'HOWDEN AG',
    },
    assekuradeur: {
      sachbearbeiter: 'Frau Schneider',
      email: 's.schneider@mrc-assekuradeur.de',
    },
    dokumente: [],
    erstelltAm: '2024-12-01',
    aktualisiertAm: '2025-01-16',
    eingereichtAm: '2024-12-05',
    angebotBis: '2025-03-01',
  },
]

// Statistik und Helper Functions
export interface AnfragenStatistik {
  gesamt: number
  nachStatus: Record<AnfrageStatus, number>
  nachDringlichkeit: Record<Dringlichkeit, number>
  offeneAnfragen: number
  abgeschlosseneAnfragen: number
  durchschnittlicherWorkflowSchritt: number
  gesamtFahrzeuge: number
  gesamtPraemienvolumen: number
}

export function berechneAnfragenStatistik(anfrageList: Anfrage[]): AnfragenStatistik {
  const nachStatus = anfrageList.reduce(
    (acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1
      return acc
    },
    {} as Record<AnfrageStatus, number>
  )

  const nachDringlichkeit = anfrageList.reduce(
    (acc, a) => {
      acc[a.dringlichkeit] = (acc[a.dringlichkeit] || 0) + 1
      return acc
    },
    {} as Record<Dringlichkeit, number>
  )

  const offeneStatus: AnfrageStatus[] = ['entwurf', 'eingereicht', 'in_pruefung', 'rueckfrage', 'deckungsanfrage', 'angebot_erstellt', 'nachverhandlung']
  const offeneAnfragen = anfrageList.filter((a) => offeneStatus.includes(a.status)).length
  const abgeschlosseneAnfragen = anfrageList.filter((a) => a.status === 'vertrag_aktiv' || a.status === 'angenommen').length

  const durchschnittlicherWorkflowSchritt =
    anfrageList.reduce((sum, a) => sum + a.aktuellerSchritt, 0) / anfrageList.length

  const gesamtFahrzeuge = anfrageList.reduce((sum, a) => sum + a.anzahlFahrzeuge, 0)
  const gesamtPraemienvolumen = anfrageList
    .filter((a) => a.gesamtPraemie)
    .reduce((sum, a) => sum + (a.gesamtPraemie || 0), 0)

  return {
    gesamt: anfrageList.length,
    nachStatus,
    nachDringlichkeit,
    offeneAnfragen,
    abgeschlosseneAnfragen,
    durchschnittlicherWorkflowSchritt: Math.round(durchschnittlicherWorkflowSchritt * 10) / 10,
    gesamtFahrzeuge,
    gesamtPraemienvolumen,
  }
}

// Helper Functions
export function getAnfrageById(id: string): Anfrage | undefined {
  return anfragen.find((a) => a.id === id)
}

export function getAnfragenByKunde(kundeId: string): Anfrage[] {
  return anfragen.filter((a) => a.kundeId === kundeId)
}

export function getAnfragenByStatus(status: AnfrageStatus): Anfrage[] {
  return anfragen.filter((a) => a.status === status)
}

export function getAnfragenByMakler(maklerEmail: string): Anfrage[] {
  return anfragen.filter((a) => a.makler.email === maklerEmail)
}

export function getOffeneAnfragen(): Anfrage[] {
  const offeneStatus: AnfrageStatus[] = ['entwurf', 'eingereicht', 'in_pruefung', 'rueckfrage', 'deckungsanfrage', 'angebot_erstellt', 'nachverhandlung']
  return anfragen.filter((a) => offeneStatus.includes(a.status))
}

export function getDringendeAnfragen(): Anfrage[] {
  return anfragen.filter((a) => a.dringlichkeit === 'dringend' || a.dringlichkeit === 'hoch')
}

export function getAnfragenMitFrist(): Anfrage[] {
  const heute = new Date()
  return anfragen.filter((a) => {
    if (!a.angebotBis) return false
    const frist = new Date(a.angebotBis)
    const diffTage = Math.ceil((frist.getTime() - heute.getTime()) / (1000 * 60 * 60 * 24))
    return diffTage <= 14 && diffTage >= 0
  })
}

// Vorberechnete Statistik
export const anfragenStatistik = berechneAnfragenStatistik(anfragen)

// Export für Dashboard-Anzeige
export const anfragenDashboard = {
  aktuell: getOffeneAnfragen(),
  dringend: getDringendeAnfragen(),
  mitFrist: getAnfragenMitFrist(),
  statistik: anfragenStatistik,
}
