import { create } from 'zustand'

export type AssekuradeurWorkflowTab =
  | 'kunde-flotte'
  | 'schadensverlauf'
  | 'deckungsanfrage'
  | 'deckung'
  | 'angebot'
  | 'vertrag'

// Deckungsanfrage Daten
export interface DeckungsanfrageData {
  // Produktauswahl
  haftpflicht: boolean
  vollkasko: boolean
  teilkasko: boolean
  insassenUnfall: boolean
  schutzbrief: boolean
  fahrerrechtsschutz: boolean

  // Deckungsparameter
  selbstbeteiligungVollkasko?: number
  selbstbeteiligungTeilkasko?: number
  deckungssummeHaftpflicht?: number

  // KO-Kriterien Evaluation
  koKriterienGeprueft: boolean
  koKriterienErfuellt: {
    schadenquote: boolean
    flottenumfang: boolean
    fahrzeugalter: boolean
    branche: boolean
  }
  verfuegbareRahmenkonzepte: number
}

// Deckung / Rahmenkonzept Auswahl
export interface DeckungData {
  selectedRahmenkonzeptId?: string
  praemienindikation?: {
    basis: number
    aufschlaege: number
    rabatte: number
    gesamt: number
  }
  vorquotierungErstellt: boolean
  vorquotierungErstelltAm?: string
}

// Angebot Daten
export interface AngebotVerwaltungData {
  angeboteAngefordert: number
  angeboteErhalten: number
  angeboteInBearbeitung: number
  angeboteAbgelehnt: number
  empfohleneAngebotId?: string
  anMaklerGesendet: boolean
  anMaklerGesendetAm?: string
}

// Vertrag Daten
export interface VertragData {
  angenommenesAngebotId?: string
  versicherungsbeginn?: string
  laufzeitMonate?: number
  zahlungsweise?: 'jaehrlich' | 'halbjaehrlich' | 'vierteljaehrlich' | 'monatlich'
  rechnungsempfaenger?: {
    firma: string
    strasse: string
    plz: string
    ort: string
  }
  iban?: string
  bic?: string
  kontoinhaber?: string
  interneNotizen?: string
  vertragAbgeschlossen: boolean
  vertragAbgeschlossenAm?: string
  vertragsNummer?: string
}

interface AnfragenWorkflowState {
  // Current anfrage being worked on
  currentAnfrageId: string | null
  setCurrentAnfrage: (anfrageId: string) => void

  // Current active tab
  activeTab: AssekuradeurWorkflowTab
  setActiveTab: (tab: AssekuradeurWorkflowTab) => void

  // Workflow data per tab
  deckungsanfrageData: DeckungsanfrageData
  deckungData: DeckungData
  angebotData: AngebotVerwaltungData
  vertragData: VertragData

  // Update actions
  updateDeckungsanfrageData: (data: Partial<DeckungsanfrageData>) => void
  updateDeckungData: (data: Partial<DeckungData>) => void
  updateAngebotData: (data: Partial<AngebotVerwaltungData>) => void
  updateVertragData: (data: Partial<VertragData>) => void

  // Actions
  pruefeKOKriterien: () => void
  erstelleVorquotierung: (rahmenkonzeptId: string) => void
  sendeAnMakler: () => void
  schliesseVertragAb: () => void

  // Load anfrage data
  loadAnfrage: (anfrageId: string) => void

  // Reset
  reset: () => void
}

const initialDeckungsanfrageData: DeckungsanfrageData = {
  haftpflicht: true,
  vollkasko: false,
  teilkasko: false,
  insassenUnfall: false,
  schutzbrief: false,
  fahrerrechtsschutz: false,
  koKriterienGeprueft: false,
  koKriterienErfuellt: {
    schadenquote: false,
    flottenumfang: false,
    fahrzeugalter: false,
    branche: false,
  },
  verfuegbareRahmenkonzepte: 0,
}

const initialDeckungData: DeckungData = {
  vorquotierungErstellt: false,
}

const initialAngebotData: AngebotVerwaltungData = {
  angeboteAngefordert: 0,
  angeboteErhalten: 0,
  angeboteInBearbeitung: 0,
  angeboteAbgelehnt: 0,
  anMaklerGesendet: false,
}

const initialVertragData: VertragData = {
  laufzeitMonate: 12,
  zahlungsweise: 'jaehrlich',
  vertragAbgeschlossen: false,
}

export const useAnfragenWorkflowStore = create<AnfragenWorkflowState>((set, get) => ({
  currentAnfrageId: null,
  activeTab: 'kunde-flotte',
  deckungsanfrageData: initialDeckungsanfrageData,
  deckungData: initialDeckungData,
  angebotData: initialAngebotData,
  vertragData: initialVertragData,

  setCurrentAnfrage: (anfrageId) => {
    set({ currentAnfrageId: anfrageId })
    // Auto-load anfrage data when setting current anfrage
    get().loadAnfrage(anfrageId)
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  updateDeckungsanfrageData: (data) =>
    set((state) => ({
      deckungsanfrageData: { ...state.deckungsanfrageData, ...data },
    })),

  updateDeckungData: (data) =>
    set((state) => ({
      deckungData: { ...state.deckungData, ...data },
    })),

  updateAngebotData: (data) =>
    set((state) => ({
      angebotData: { ...state.angebotData, ...data },
    })),

  updateVertragData: (data) =>
    set((state) => ({
      vertragData: { ...state.vertragData, ...data },
    })),

  pruefeKOKriterien: () => {
    // Import dynamically to avoid circular dependencies
    import('@/stores/demo-data/anfragen').then(({ anfragen }) => {
      import('@/stores/demo-data/musterfirma-renta').then(({ musterfirmaRentaJahre }) => {
        import('@/stores/demo-data/musterfirma-flotte').then(({ musterfirmaFlotte }) => {
          const { currentAnfrageId, deckungsanfrageData } = get()
          if (!currentAnfrageId) return

          const anfrage = anfragen.find((a) => a.id === currentAnfrageId)
          if (!anfrage) return

          // KO-Kriterien Prüfung
          // 1. Schadenquote < 60%
          const letzteJahre = musterfirmaRentaJahre.slice(-3)
          const durchschnittsSQ =
            letzteJahre.reduce((sum, jahr) => sum + jahr.schadenquote, 0) / letzteJahre.length
          const schadenquoteOk = durchschnittsSQ < 60

          // 2. Flottenumfang: 10-500 Fahrzeuge
          const flottenumfangOk = musterfirmaFlotte.length >= 10 && musterfirmaFlotte.length <= 500

          // 3. Fahrzeugalter: Durchschnitt < 8 Jahre
          const durchschnittsalter =
            musterfirmaFlotte.reduce((sum, f) => {
              const alter = new Date().getFullYear() - new Date(f.erstzulassung).getFullYear()
              return sum + alter
            }, 0) / musterfirmaFlotte.length
          const fahrzeugalterOk = durchschnittsalter < 8

          // 4. Branche: Logistik akzeptiert (könnte auch blacklist sein)
          const brancheOk = anfrage.kunde.branche.toLowerCase().includes('logistik')

          const koKriterienErfuellt = {
            schadenquote: schadenquoteOk,
            flottenumfang: flottenumfangOk,
            fahrzeugalter: fahrzeugalterOk,
            branche: brancheOk,
          }

          // Verfügbare Rahmenkonzepte zählen (alle erfüllt = 4 verfügbar)
          const erfuellt = Object.values(koKriterienErfuellt).filter(Boolean).length
          const verfuegbareRahmenkonzepte = erfuellt === 4 ? 4 : 0

          set({
            deckungsanfrageData: {
              ...deckungsanfrageData,
              koKriterienGeprueft: true,
              koKriterienErfuellt,
              verfuegbareRahmenkonzepte,
            },
          })
        })
      })
    })
  },

  erstelleVorquotierung: (rahmenkonzeptId) => {
    import('@/stores/demo-data/rahmenkonzepte').then(({ rahmenkonzepte, berechnePraemie }) => {
      import('@/stores/demo-data/anfragen').then(({ anfragen }) => {
        const { currentAnfrageId } = get()
        if (!currentAnfrageId) return

        const anfrage = anfragen.find((a) => a.id === currentAnfrageId)
        if (!anfrage) return

        const rahmenkonzept = rahmenkonzepte.find((rk) => rk.id === rahmenkonzeptId)
        if (!rahmenkonzept) return

        // Berechne Prämie basierend auf Rahmenkonzept
        const basisPraemie = berechnePraemie(rahmenkonzept, anfrage.anzahlFahrzeuge, true, true)
        const aufschlaege = basisPraemie * 0.15 // 15% Aufschläge (Beispiel)
        const rabatte = basisPraemie * 0.08 // 8% Rabatt (Beispiel)
        const gesamt = Math.round(basisPraemie + aufschlaege - rabatte)

        const praemienindikation = {
          basis: basisPraemie,
          aufschlaege: Math.round(aufschlaege),
          rabatte: Math.round(rabatte),
          gesamt,
        }

        set({
          deckungData: {
            selectedRahmenkonzeptId: rahmenkonzeptId,
            praemienindikation,
            vorquotierungErstellt: true,
            vorquotierungErstelltAm: new Date().toISOString(),
          },
        })
      })
    })
  },

  sendeAnMakler: () => {
    const { angebotData } = get()
    set({
      angebotData: {
        ...angebotData,
        anMaklerGesendet: true,
        anMaklerGesendetAm: new Date().toISOString(),
      },
    })
  },

  schliesseVertragAb: () => {
    const { vertragData } = get()
    const vertragsNummer = `VTR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`

    set({
      vertragData: {
        ...vertragData,
        vertragAbgeschlossen: true,
        vertragAbgeschlossenAm: new Date().toISOString(),
        vertragsNummer,
      },
    })
  },

  loadAnfrage: (anfrageId) => {
    // Import dynamically to avoid circular dependencies
    import('@/stores/demo-data/anfragen').then(({ anfragen }) => {
      import('@/stores/demo-data/angebote').then(({ getAngeboteFuerAnfrage }) => {
        const anfrage = anfragen.find((a) => a.id === anfrageId)
        if (!anfrage) return

        // Load Deckungsanfrage data from anfrage (default values as API doesn't store these separately)
        const deckungsanfrageData: DeckungsanfrageData = {
          haftpflicht: true,
          vollkasko: true,
          teilkasko: true,
          insassenUnfall: false,
          schutzbrief: false,
          fahrerrechtsschutz: false,
          selbstbeteiligungVollkasko: 1000,
          selbstbeteiligungTeilkasko: 500,
          deckungssummeHaftpflicht: 100000000,
          koKriterienGeprueft: false,
          koKriterienErfuellt: {
            schadenquote: false,
            flottenumfang: false,
            fahrzeugalter: false,
            branche: false,
          },
          verfuegbareRahmenkonzepte: 0,
        }

        // Load Deckung data
        const deckungData: DeckungData = {
          selectedRahmenkonzeptId: undefined,
          vorquotierungErstellt: anfrage.status !== 'eingereicht' && anfrage.status !== 'entwurf',
          vorquotierungErstelltAm: anfrage.status !== 'eingereicht' ? anfrage.aktualisiertAm : undefined,
        }

        // Load Angebot data
        const angebote = getAngeboteFuerAnfrage(anfrageId)
        const angebotData: AngebotVerwaltungData = {
          angeboteAngefordert: angebote.length,
          angeboteErhalten: angebote.filter((a) => a.status === 'angebot_erhalten').length,
          angeboteInBearbeitung: angebote.filter((a) => a.status === 'in_bearbeitung').length,
          angeboteAbgelehnt: angebote.filter((a) => a.status === 'abgelehnt_versicherer' || a.status === 'abgelehnt_kunde').length,
          empfohleneAngebotId: angebote.find((a) => a.empfohlen)?.id,
          anMaklerGesendet: anfrage.status === 'angebot_erstellt' || anfrage.status === 'angenommen',
          anMaklerGesendetAm: anfrage.status === 'angebot_erstellt' ? anfrage.aktualisiertAm : undefined,
        }

        // Load Vertrag data
        const angenommenesAngebot = angebote.find((a) => a.status === 'angenommen')
        const vertragData: VertragData = {
          angenommenesAngebotId: angenommenesAngebot?.id,
          versicherungsbeginn: anfrage.versicherungsbeginn,
          laufzeitMonate: anfrage.laufzeit,
          zahlungsweise: 'jaehrlich',
          interneNotizen: anfrage.interneNotizen,
          vertragAbgeschlossen: anfrage.status === 'vertrag_aktiv',
          vertragAbgeschlossenAm: anfrage.status === 'vertrag_aktiv' ? anfrage.aktualisiertAm : undefined,
          vertragsNummer: undefined, // Would be added when contract is created
        }

        set({
          deckungsanfrageData,
          deckungData,
          angebotData,
          vertragData,
        })
      })
    })
  },

  reset: () =>
    set({
      currentAnfrageId: null,
      activeTab: 'kunde-flotte',
      deckungsanfrageData: initialDeckungsanfrageData,
      deckungData: initialDeckungData,
      angebotData: initialAngebotData,
      vertragData: initialVertragData,
    }),
}))
