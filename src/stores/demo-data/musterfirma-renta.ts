/**
 * Musterfirma GmbH - Renta-Daten (Rentabilitätsanalyse)
 * 6 Jahre Prämienverlauf und Schadenquoten für die KFZ-Flottenversicherung Demo
 * Zeitraum: 2019-2024
 */

export interface JahresRenta {
  jahr: number
  // Prämien
  bruttoJahrespraemie: number
  nettoJahrespraemie: number // nach Provisionen/Kosten
  praemieneinnahmen: number // tatsächlich gezahlt (inkl. Nachzahlungen, abzgl. Erstattungen)

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
  flottenEntwicklung: 'gewachsen' | 'stabil' | 'geschrumpft'

  // Details nach Sparte
  spartenDetails: {
    haftpflicht: SpartenJahresDaten
    vollkasko: SpartenJahresDaten
    teilkasko: SpartenJahresDaten
  }
}

export interface SpartenJahresDaten {
  praemie: number
  schaeden: number
  aufwand: number
  auszahlung: number
  quote: number // Schadenquote in %
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

// 6 Jahre Renta-Daten (2019-2024)
export const musterfirmaRentaJahre: JahresRenta[] = [
  {
    jahr: 2019,
    bruttoJahrespraemie: 89500,
    nettoJahrespraemie: 76075,
    praemieneinnahmen: 88200,
    anzahlSchaeden: 8,
    schadenaufwand: 34710,
    auszahlungen: 34710,
    reserven: 0,
    schadenquote: 38.8,
    kombinierteQuote: 52.3,
    schadendurchschnitt: 4339,
    schadenhaeufigkeit: 14.5,
    anzahlFahrzeuge: 55,
    flottenEntwicklung: 'gewachsen',
    spartenDetails: {
      haftpflicht: {
        praemie: 48200,
        schaeden: 3,
        aufwand: 15870,
        auszahlung: 15870,
        quote: 32.9,
      },
      vollkasko: {
        praemie: 28500,
        schaeden: 2,
        aufwand: 5540,
        auszahlung: 4040,
        quote: 19.4,
      },
      teilkasko: {
        praemie: 12800,
        schaeden: 3,
        aufwand: 13300,
        auszahlung: 14800,
        quote: 103.9,
      },
    },
  },
  {
    jahr: 2020,
    bruttoJahrespraemie: 95800,
    nettoJahrespraemie: 81430,
    praemieneinnahmen: 94500,
    anzahlSchaeden: 12,
    schadenaufwand: 52850,
    auszahlungen: 51900,
    reserven: 950,
    schadenquote: 55.2,
    kombinierteQuote: 68.5,
    schadendurchschnitt: 4404,
    schadenhaeufigkeit: 21.1,
    anzahlFahrzeuge: 57,
    flottenEntwicklung: 'gewachsen',
    spartenDetails: {
      haftpflicht: {
        praemie: 51500,
        schaeden: 4,
        aufwand: 14300,
        auszahlung: 14300,
        quote: 27.8,
      },
      vollkasko: {
        praemie: 30800,
        schaeden: 4,
        aufwand: 18620,
        auszahlung: 18120,
        quote: 60.5,
      },
      teilkasko: {
        praemie: 13500,
        schaeden: 4,
        aufwand: 19930,
        auszahlung: 19480,
        quote: 147.6,
      },
    },
  },
  {
    jahr: 2021,
    bruttoJahrespraemie: 102400,
    nettoJahrespraemie: 87040,
    praemieneinnahmen: 101200,
    anzahlSchaeden: 14,
    schadenaufwand: 58650,
    auszahlungen: 57150,
    reserven: 1500,
    schadenquote: 57.3,
    kombinierteQuote: 71.2,
    schadendurchschnitt: 4189,
    schadenhaeufigkeit: 23.3,
    anzahlFahrzeuge: 60,
    flottenEntwicklung: 'gewachsen',
    spartenDetails: {
      haftpflicht: {
        praemie: 55200,
        schaeden: 5,
        aufwand: 23150,
        auszahlung: 23150,
        quote: 41.9,
      },
      vollkasko: {
        praemie: 32800,
        schaeden: 5,
        aufwand: 17600,
        auszahlung: 15100,
        quote: 53.7,
      },
      teilkasko: {
        praemie: 14400,
        schaeden: 4,
        aufwand: 17900,
        auszahlung: 18900,
        quote: 124.3,
      },
    },
  },
  {
    jahr: 2022,
    bruttoJahrespraemie: 108600,
    nettoJahrespraemie: 92310,
    praemieneinnahmen: 107400,
    anzahlSchaeden: 12,
    schadenaufwand: 39080,
    auszahlungen: 38130,
    reserven: 950,
    schadenquote: 36.0,
    kombinierteQuote: 49.8,
    schadendurchschnitt: 3257,
    schadenhaeufigkeit: 19.4,
    anzahlFahrzeuge: 62,
    flottenEntwicklung: 'stabil',
    spartenDetails: {
      haftpflicht: {
        praemie: 58500,
        schaeden: 4,
        aufwand: 14000,
        auszahlung: 14000,
        quote: 23.9,
      },
      vollkasko: {
        praemie: 34800,
        schaeden: 5,
        aufwand: 14640,
        auszahlung: 12590,
        quote: 42.1,
      },
      teilkasko: {
        praemie: 15300,
        schaeden: 3,
        aufwand: 10440,
        auszahlung: 11540,
        quote: 68.2,
      },
    },
  },
  {
    jahr: 2023,
    bruttoJahrespraemie: 112800,
    nettoJahrespraemie: 95880,
    praemieneinnahmen: 111500,
    anzahlSchaeden: 11,
    schadenaufwand: 48450,
    auszahlungen: 45830,
    reserven: 2620,
    schadenquote: 43.0,
    kombinierteQuote: 56.9,
    schadendurchschnitt: 4405,
    schadenhaeufigkeit: 17.7,
    anzahlFahrzeuge: 62,
    flottenEntwicklung: 'stabil',
    spartenDetails: {
      haftpflicht: {
        praemie: 60800,
        schaeden: 3,
        aufwand: 10500,
        auszahlung: 10500,
        quote: 17.3,
      },
      vollkasko: {
        praemie: 36200,
        schaeden: 5,
        aufwand: 22230,
        auszahlung: 18730,
        quote: 61.4,
      },
      teilkasko: {
        praemie: 15800,
        schaeden: 3,
        aufwand: 15720,
        auszahlung: 16600,
        quote: 99.5,
      },
    },
  },
  {
    jahr: 2024,
    bruttoJahrespraemie: 118500,
    nettoJahrespraemie: 100725,
    praemieneinnahmen: 98400, // Jahr noch nicht vollständig
    anzahlSchaeden: 10,
    schadenaufwand: 72090,
    auszahlungen: 62840,
    reserven: 9250,
    schadenquote: 60.9,
    kombinierteQuote: 75.4,
    schadendurchschnitt: 7209,
    schadenhaeufigkeit: 16.1,
    anzahlFahrzeuge: 62,
    flottenEntwicklung: 'stabil',
    spartenDetails: {
      haftpflicht: {
        praemie: 64200,
        schaeden: 3,
        aufwand: 7800,
        auszahlung: 7800,
        quote: 12.1,
      },
      vollkasko: {
        praemie: 38000,
        schaeden: 4,
        aufwand: 51390,
        auszahlung: 43340,
        quote: 135.2,
      },
      teilkasko: {
        praemie: 16300,
        schaeden: 3,
        aufwand: 12900,
        auszahlung: 11700,
        quote: 79.1,
      },
    },
  },
]

// Quartalsdaten für detailliertere Auswertung
export const musterfirmaRentaQuartale: QuartalsRenta[] = [
  // 2022
  {
    jahr: 2022,
    quartal: 1,
    praemie: 26850,
    schadenaufwand: 7520,
    schadenquote: 28.0,
    anzahlSchaeden: 2,
    anzahlFahrzeuge: 61,
  },
  {
    jahr: 2022,
    quartal: 2,
    praemie: 27150,
    schadenaufwand: 8760,
    schadenquote: 32.3,
    anzahlSchaeden: 3,
    anzahlFahrzeuge: 62,
  },
  {
    jahr: 2022,
    quartal: 3,
    praemie: 27300,
    schadenaufwand: 11700,
    schadenquote: 42.9,
    anzahlSchaeden: 4,
    anzahlFahrzeuge: 62,
  },
  {
    jahr: 2022,
    quartal: 4,
    praemie: 27300,
    schadenaufwand: 11100,
    schadenquote: 40.7,
    anzahlSchaeden: 3,
    anzahlFahrzeuge: 62,
  },
  // 2023
  {
    jahr: 2023,
    quartal: 1,
    praemie: 27950,
    schadenaufwand: 12300,
    schadenquote: 44.0,
    anzahlSchaeden: 3,
    anzahlFahrzeuge: 62,
  },
  {
    jahr: 2023,
    quartal: 2,
    praemie: 28200,
    schadenaufwand: 7550,
    schadenquote: 26.8,
    anzahlSchaeden: 2,
    anzahlFahrzeuge: 62,
  },
  {
    jahr: 2023,
    quartal: 3,
    praemie: 28325,
    schadenaufwand: 9700,
    schadenquote: 34.2,
    anzahlSchaeden: 3,
    anzahlFahrzeuge: 62,
  },
  {
    jahr: 2023,
    quartal: 4,
    praemie: 28325,
    schadenaufwand: 18900,
    schadenquote: 66.7,
    anzahlSchaeden: 3,
    anzahlFahrzeuge: 62,
  },
  // 2024
  {
    jahr: 2024,
    quartal: 1,
    praemie: 29450,
    schadenaufwand: 8190,
    schadenquote: 27.8,
    anzahlSchaeden: 2,
    anzahlFahrzeuge: 62,
  },
  {
    jahr: 2024,
    quartal: 2,
    praemie: 29625,
    schadenaufwand: 11700,
    schadenquote: 39.5,
    anzahlSchaeden: 3,
    anzahlFahrzeuge: 62,
  },
  {
    jahr: 2024,
    quartal: 3,
    praemie: 29700,
    schadenaufwand: 40300,
    schadenquote: 135.7,
    anzahlSchaeden: 3,
    anzahlFahrzeuge: 62,
  },
  {
    jahr: 2024,
    quartal: 4,
    praemie: 29725,
    schadenaufwand: 11900,
    schadenquote: 40.0,
    anzahlSchaeden: 2,
    anzahlFahrzeuge: 62,
  },
]

// Monatsdaten für das aktuelle Jahr (2024)
export const musterfirmaRentaMonate2024: MonatsRenta[] = [
  { jahr: 2024, monat: 1, praemie: 9850, schadenaufwand: 2800, schadenquote: 28.4, anzahlSchaeden: 1 },
  { jahr: 2024, monat: 2, praemie: 9850, schadenaufwand: 890, schadenquote: 9.0, anzahlSchaeden: 1 },
  { jahr: 2024, monat: 3, praemie: 9875, schadenaufwand: 4500, schadenquote: 45.6, anzahlSchaeden: 1 },
  { jahr: 2024, monat: 4, praemie: 9875, schadenaufwand: 2200, schadenquote: 22.3, anzahlSchaeden: 1 },
  { jahr: 2024, monat: 5, praemie: 9875, schadenaufwand: 1200, schadenquote: 12.2, anzahlSchaeden: 1 },
  {
    jahr: 2024,
    monat: 6,
    praemie: 9875,
    schadenaufwand: 5800,
    schadenquote: 58.7,
    anzahlSchaeden: 1,
  },
  { jahr: 2024, monat: 7, praemie: 9900, schadenaufwand: 0, schadenquote: 0, anzahlSchaeden: 0 },
  {
    jahr: 2024,
    monat: 8,
    praemie: 9900,
    schadenaufwand: 28500,
    schadenquote: 287.9,
    anzahlSchaeden: 1,
  },
  {
    jahr: 2024,
    monat: 9,
    praemie: 9900,
    schadenaufwand: 3800,
    schadenquote: 38.4,
    anzahlSchaeden: 1,
  },
  { jahr: 2024, monat: 10, praemie: 9900, schadenaufwand: 0, schadenquote: 0, anzahlSchaeden: 0 },
  {
    jahr: 2024,
    monat: 11,
    praemie: 9900,
    schadenaufwand: 18500,
    schadenquote: 186.9,
    anzahlSchaeden: 1,
  },
  {
    jahr: 2024,
    monat: 12,
    praemie: 9900,
    schadenaufwand: 4500,
    schadenquote: 45.5,
    anzahlSchaeden: 1,
  },
]

// Zusammenfassung / KPIs
export interface RentaZusammenfassung {
  zeitraum: string
  anzahlJahre: number
  gesamtPraemien: number
  gesamtSchaedenAufwand: number
  gesamtSchaeden: number
  durchschnittlicheSchadenquote: number
  durchschnittlicherJahresschaden: number
  trend: 'positiv' | 'stabil' | 'negativ'
  empfehlung: string
}

export function berechneRentaZusammenfassung(
  rentaDaten: JahresRenta[]
): RentaZusammenfassung {
  const gesamtPraemien = rentaDaten.reduce((sum, r) => sum + r.bruttoJahrespraemie, 0)
  const gesamtSchaedenAufwand = rentaDaten.reduce((sum, r) => sum + r.schadenaufwand, 0)
  const gesamtSchaeden = rentaDaten.reduce((sum, r) => sum + r.anzahlSchaeden, 0)

  const durchschnittlicheSchadenquote =
    rentaDaten.reduce((sum, r) => sum + r.schadenquote, 0) / rentaDaten.length
  const durchschnittlicherJahresschaden = gesamtSchaedenAufwand / rentaDaten.length

  // Trend berechnen (basierend auf den letzten 3 Jahren)
  const letzteDreiJahre = rentaDaten.slice(-3)
  const quoten = letzteDreiJahre.map((r) => r.schadenquote)
  const trendWert = quoten[2] - quoten[0]

  let trend: 'positiv' | 'stabil' | 'negativ'
  let empfehlung: string

  if (trendWert > 10) {
    trend = 'negativ'
    empfehlung =
      'Die Schadenquote zeigt einen steigenden Trend. Prüfung der Fahrerschulungen und Flottenmanagement empfohlen.'
  } else if (trendWert < -10) {
    trend = 'positiv'
    empfehlung =
      'Positive Entwicklung der Schadenquote. Aktuelle Maßnahmen beibehalten. Prämienreduzierung bei Vertragsverlängerung möglich.'
  } else {
    trend = 'stabil'
    empfehlung =
      'Stabile Schadenentwicklung. Risikomanagement zeigt Wirkung. Vertragsverlängerung zu aktuellen Konditionen empfohlen.'
  }

  return {
    zeitraum: `${rentaDaten[0].jahr}-${rentaDaten[rentaDaten.length - 1].jahr}`,
    anzahlJahre: rentaDaten.length,
    gesamtPraemien,
    gesamtSchaedenAufwand,
    gesamtSchaeden,
    durchschnittlicheSchadenquote: Math.round(durchschnittlicheSchadenquote * 10) / 10,
    durchschnittlicherJahresschaden: Math.round(durchschnittlicherJahresschaden),
    trend,
    empfehlung,
  }
}

// Vergleichsdaten für Benchmark
export interface BranchenBenchmark {
  branche: string
  durchschnittsSchadenquote: number
  durchschnittsSchadenhaeufigkeit: number
  durchschnittsSchaden: number
}

export const branchenBenchmarks: BranchenBenchmark[] = [
  {
    branche: 'Logistik & Transport',
    durchschnittsSchadenquote: 62.5,
    durchschnittsSchadenhaeufigkeit: 22.0,
    durchschnittsSchaden: 4800,
  },
  {
    branche: 'Spedition',
    durchschnittsSchadenquote: 58.0,
    durchschnittsSchadenhaeufigkeit: 20.5,
    durchschnittsSchaden: 4500,
  },
  {
    branche: 'Kurierdienst',
    durchschnittsSchadenquote: 55.0,
    durchschnittsSchadenhaeufigkeit: 25.0,
    durchschnittsSchaden: 3200,
  },
  {
    branche: 'Baugewerbe',
    durchschnittsSchadenquote: 70.0,
    durchschnittsSchadenhaeufigkeit: 18.5,
    durchschnittsSchaden: 6200,
  },
  {
    branche: 'Handwerk',
    durchschnittsSchadenquote: 48.0,
    durchschnittsSchadenhaeufigkeit: 15.0,
    durchschnittsSchaden: 3800,
  },
]

export function getBranchenBenchmark(branche: string): BranchenBenchmark | undefined {
  return branchenBenchmarks.find((b) => b.branche === branche)
}

// Prognose für das nächste Jahr
export interface RentaPrognose {
  jahr: number
  prognosePraemie: number
  prognoseSchadenquote: number
  prognoseAufwand: number
  konfidenzLevel: 'hoch' | 'mittel' | 'niedrig'
  annahmen: string[]
}

export function erstelleRentaPrognose(rentaDaten: JahresRenta[]): RentaPrognose {
  const letztesJahr = rentaDaten[rentaDaten.length - 1]
  const vorletztes = rentaDaten[rentaDaten.length - 2]

  // Einfache lineare Prognose
  const praemienWachstum = (letztesJahr.bruttoJahrespraemie - vorletztes.bruttoJahrespraemie) / vorletztes.bruttoJahrespraemie
  const durchschnittsquote = rentaDaten.reduce((sum, r) => sum + r.schadenquote, 0) / rentaDaten.length

  const prognosePraemie = Math.round(
    letztesJahr.bruttoJahrespraemie * (1 + praemienWachstum * 0.5)
  )
  const prognoseSchadenquote = Math.round((durchschnittsquote + letztesJahr.schadenquote) / 2 * 10) / 10
  const prognoseAufwand = Math.round(prognosePraemie * (prognoseSchadenquote / 100))

  return {
    jahr: letztesJahr.jahr + 1,
    prognosePraemie,
    prognoseSchadenquote,
    prognoseAufwand,
    konfidenzLevel: 'mittel',
    annahmen: [
      'Flottenbestand bleibt stabil (ca. 62 Fahrzeuge)',
      'Keine außergewöhnlichen Großschäden',
      'Normale Schadenentwicklung ohne extreme Wetterereignisse',
      'Gleichbleibende Nutzungsintensität',
    ],
  }
}

// Helper Functions
export function getRentaByJahr(jahr: number): JahresRenta | undefined {
  return musterfirmaRentaJahre.find((r) => r.jahr === jahr)
}

export function getQuartaleByJahr(jahr: number): QuartalsRenta[] {
  return musterfirmaRentaQuartale.filter((q) => q.jahr === jahr)
}

export function getMonateByJahr(jahr: number): MonatsRenta[] {
  if (jahr === 2024) {
    return musterfirmaRentaMonate2024
  }
  return []
}

// Vorberechnete Zusammenfassung
export const rentaZusammenfassung = berechneRentaZusammenfassung(musterfirmaRentaJahre)

// Vorberechnete Prognose
export const rentaPrognose2025 = erstelleRentaPrognose(musterfirmaRentaJahre)

// Export für Charts
export const rentaChartDaten = {
  jahresverlauf: musterfirmaRentaJahre.map((r) => ({
    jahr: r.jahr,
    praemie: r.bruttoJahrespraemie,
    schadenaufwand: r.schadenaufwand,
    schadenquote: r.schadenquote,
  })),
  quartalsverlauf: musterfirmaRentaQuartale.map((q) => ({
    periode: `Q${q.quartal}/${q.jahr}`,
    praemie: q.praemie,
    schadenaufwand: q.schadenaufwand,
    schadenquote: q.schadenquote,
  })),
  monatsverlauf2024: musterfirmaRentaMonate2024.map((m) => ({
    monat: m.monat,
    praemie: m.praemie,
    schadenaufwand: m.schadenaufwand,
    schadenquote: m.schadenquote,
  })),
}
