/**
 * Shared Types: Deckung
 * Konsolidierte Typen für Deckungsabfragen und -parameter
 */

export type Produktart =
  | 'kfz_haftpflicht'
  | 'vollkasko'
  | 'teilkasko'
  | 'insassen_unfall'
  | 'schutzbrief'

export type DeckungsStufe = 'basis' | 'komfort' | 'premium'

export interface DeckungsumfangProdukte {
  haftpflicht: boolean
  vollkasko: boolean
  teilkasko: boolean
  insassenUnfall: boolean
  schutzbrief: boolean
  fahrerrechtsschutz: boolean
}

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

export interface DeckungsanfrageData {
  // Produktauswahl
  produkte: DeckungsumfangProdukte

  // Parameter
  parameter: Deckungsparameter

  // Versicherungsbeginn
  versicherungsbeginn?: string

  // Laufzeit
  laufzeitMonate?: number

  // Optionale Angaben
  nettoisierung?: boolean
  alternativangebote?: boolean
  notizen?: string
}

// KO-Kriterien
export interface KOKriterienPruefung {
  schadenquote: boolean
  flottenumfang: boolean
  fahrzeugalter: boolean
  branche: boolean
}

export interface KOKriterienErgebnis {
  geprueft: boolean
  kriterien: KOKriterienPruefung
  verfuegbareRahmenkonzepte: number
  ablehnungsgruende?: string[]
}
