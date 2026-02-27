/**
 * Shared Types: Rahmenkonzept
 * Konsolidierte Typen für Versicherungsprodukte und Rahmenverträge
 */

import { type Produktart, type DeckungsStufe, type Deckungsparameter } from './deckung'

export type RahmenkonzeptStatus = 'aktiv' | 'inaktiv' | 'ausgelaufen'

export interface KOKriterium {
  id: string
  beschreibung: string
  parameter: string
  schwellwert: number | string
  erfuellt: boolean
  prioritaet: 'hoch' | 'mittel' | 'niedrig'
}

export interface RabattStaffel {
  abFahrzeuge: number
  rabatt: number // in %
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
  rabattStaffel: RabattStaffel[] // Mengenrabatt

  // Status
  status: RahmenkonzeptStatus

  // Metadaten
  beschreibung: string
  besonderheiten?: string[]
}

// Prämienindikation
export interface Praemienindikation {
  basis: number
  aufschlaege: number
  rabatte: number
  gesamt: number
}

// Rahmenkonzept-Eignung
export interface RahmenkonzeptEignung {
  rahmenkonzept: Rahmenkonzept
  eignung: 'geeignet' | 'bedingt_geeignet' | 'nicht_geeignet'
  koKriterienErfuellt: boolean
  ablehnungsgruende?: string[]
  praemienindikation?: Praemienindikation
}
