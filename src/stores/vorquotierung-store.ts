import { create } from 'zustand'

export type VersichererWorkflowTab =
  | 'kunde-flotte'
  | 'schadensverlauf'
  | 'deckungsanfrage'
  | 'kalkulation'
  | 'entscheidung'

export type EntscheidungType = 'bestaetigen' | 'ablehnen' | 'aendern' | null

// Kalkulation Daten
export interface KalkulationData {
  basisPraemie: number
  risikoZuschlag: number // Prozent
  schadenZuschlag: number // Prozent
  mengenRabatt: number // Prozent (negative value)
  gesamtPraemieNetto: number
  gesamtPraemieBrutto: number
  selbstbeteiligungVollkasko: number
  selbstbeteiligungTeilkasko: number
  versicherungssteuer: number // 19%
  kalkulationGespeichert: boolean
  kalkulationGespeichertAm?: string
}

// Entscheidung Daten
export interface EntscheidungData {
  entscheidungsTyp: EntscheidungType

  // Bestätigung
  interneNotiz?: string

  // Ablehnung
  ablehnungsgrund?: string
  ablehnungsgrundDetailliert?: string

  // Änderung
  aenderungsgrund?: string
  geaendertePraemie?: number
  geaenderteSelbstbeteiligungVK?: number
  geaenderteSelbstbeteiligungTK?: number

  // Status
  entscheidungGetroffen: boolean
  entscheidungGetroffenAm?: string
}

interface VorquotierungState {
  // Current vorquotierung/angebot being worked on
  currentVorquotierungId: string | null
  currentAngebotId: string | null
  setCurrentVorquotierung: (vorquotierungId: string, angebotId: string) => void

  // Current active tab
  activeTab: VersichererWorkflowTab
  setActiveTab: (tab: VersichererWorkflowTab) => void

  // Workflow data
  kalkulationData: KalkulationData
  entscheidungData: EntscheidungData

  // Update actions
  updateKalkulationData: (data: Partial<KalkulationData>) => void
  updateEntscheidungData: (data: Partial<EntscheidungData>) => void

  // Calculations
  berechneGesamtPraemie: () => { netto: number; brutto: number }

  // Actions
  speichereKalkulation: () => void
  triffEntscheidung: (type: EntscheidungType) => void
  bestaetigen: (interneNotiz?: string) => void
  ablehnen: (ablehnungsgrund: string, detaillierteBegründung?: string) => void
  aendern: (geaendertePraemie: number, geaenderteSBVK: number, geaenderteSBTK: number, aenderungsgrund: string) => void

  // Load vorquotierung data
  loadVorquotierung: (vorquotierungId: string, angebotId: string) => void

  // Reset
  reset: () => void
}

const initialKalkulationData: KalkulationData = {
  basisPraemie: 50000,
  risikoZuschlag: 5,
  schadenZuschlag: 10,
  mengenRabatt: -8,
  gesamtPraemieNetto: 0,
  gesamtPraemieBrutto: 0,
  selbstbeteiligungVollkasko: 1000,
  selbstbeteiligungTeilkasko: 500,
  versicherungssteuer: 19,
  kalkulationGespeichert: false,
}

const initialEntscheidungData: EntscheidungData = {
  entscheidungsTyp: null,
  entscheidungGetroffen: false,
}

export const useVorquotierungStore = create<VorquotierungState>((set, get) => ({
  currentVorquotierungId: null,
  currentAngebotId: null,
  activeTab: 'kunde-flotte',
  kalkulationData: initialKalkulationData,
  entscheidungData: initialEntscheidungData,

  setCurrentVorquotierung: (vorquotierungId, angebotId) => {
    set({
      currentVorquotierungId: vorquotierungId,
      currentAngebotId: angebotId,
    })
    // Auto-load vorquotierung data
    get().loadVorquotierung(vorquotierungId, angebotId)
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  updateKalkulationData: (data) => {
    set((state) => ({
      kalkulationData: { ...state.kalkulationData, ...data },
    }))

    // Auto-calculate when data changes
    if (data.basisPraemie !== undefined ||
        data.risikoZuschlag !== undefined ||
        data.schadenZuschlag !== undefined ||
        data.mengenRabatt !== undefined) {
      const { netto, brutto } = get().berechneGesamtPraemie()
      set((state) => ({
        kalkulationData: {
          ...state.kalkulationData,
          gesamtPraemieNetto: netto,
          gesamtPraemieBrutto: brutto,
        },
      }))
    }
  },

  updateEntscheidungData: (data) =>
    set((state) => ({
      entscheidungData: { ...state.entscheidungData, ...data },
    })),

  berechneGesamtPraemie: () => {
    const { kalkulationData } = get()
    const basis = kalkulationData.basisPraemie
    const zuschlag1 = basis * (kalkulationData.risikoZuschlag / 100)
    const zuschlag2 = basis * (kalkulationData.schadenZuschlag / 100)
    const rabatt = basis * (Math.abs(kalkulationData.mengenRabatt) / 100)
    const netto = Math.round(basis + zuschlag1 + zuschlag2 - rabatt)
    const brutto = Math.round(netto * (1 + kalkulationData.versicherungssteuer / 100))

    return { netto, brutto }
  },

  speichereKalkulation: () => {
    const { netto, brutto } = get().berechneGesamtPraemie()

    set((state) => ({
      kalkulationData: {
        ...state.kalkulationData,
        gesamtPraemieNetto: netto,
        gesamtPraemieBrutto: brutto,
        kalkulationGespeichert: true,
        kalkulationGespeichertAm: new Date().toISOString(),
      },
    }))
  },

  triffEntscheidung: (type) => {
    set((state) => ({
      entscheidungData: {
        ...state.entscheidungData,
        entscheidungsTyp: type,
      },
    }))
  },

  bestaetigen: (interneNotiz) => {
    set((state) => ({
      entscheidungData: {
        ...state.entscheidungData,
        entscheidungsTyp: 'bestaetigen',
        interneNotiz,
        entscheidungGetroffen: true,
        entscheidungGetroffenAm: new Date().toISOString(),
      },
    }))
  },

  ablehnen: (ablehnungsgrund, ablehnungsgrundDetailliert) => {
    set((state) => ({
      entscheidungData: {
        ...state.entscheidungData,
        entscheidungsTyp: 'ablehnen',
        ablehnungsgrund,
        ablehnungsgrundDetailliert,
        entscheidungGetroffen: true,
        entscheidungGetroffenAm: new Date().toISOString(),
      },
    }))
  },

  aendern: (geaendertePraemie, geaenderteSBVK, geaenderteSBTK, aenderungsgrund) => {
    set((state) => ({
      entscheidungData: {
        ...state.entscheidungData,
        entscheidungsTyp: 'aendern',
        aenderungsgrund,
        geaendertePraemie,
        geaenderteSelbstbeteiligungVK: geaenderteSBVK,
        geaenderteSelbstbeteiligungTK: geaenderteSBTK,
        entscheidungGetroffen: true,
        entscheidungGetroffenAm: new Date().toISOString(),
      },
    }))
  },

  loadVorquotierung: (vorquotierungId, angebotId) => {
    // Import dynamically to avoid circular dependencies
    import('@/stores/demo-data/angebote').then(({ angebote }) => {
      const angebot = angebote.find((a) => a.id === angebotId || a.angebotsNummer === vorquotierungId)

      if (!angebot) {
        console.warn('Angebot not found:', angebotId, vorquotierungId)
        return
      }

      // Load Kalkulation data from angebot
      const basisPraemie = angebot.jahrespraemieNetto || 50000
      const kalkulationData: KalkulationData = {
        basisPraemie,
        risikoZuschlag: 5,
        schadenZuschlag: 10,
        mengenRabatt: -8,
        gesamtPraemieNetto: angebot.jahrespraemieNetto || 0,
        gesamtPraemieBrutto: angebot.jahrespraemieBrutto || 0,
        selbstbeteiligungVollkasko: angebot.selbstbeteiligungVollkasko || 1000,
        selbstbeteiligungTeilkasko: angebot.selbstbeteiligungTeilkasko || 500,
        versicherungssteuer: angebot.versicherungssteuer || 19,
        kalkulationGespeichert: true,
        kalkulationGespeichertAm: angebot.angefordertAm,
      }

      // Load Entscheidung data (if decision was already made)
      let entscheidungData: EntscheidungData = {
        entscheidungsTyp: null,
        entscheidungGetroffen: false,
      }

      if (angebot.status === 'angebot_erhalten') {
        entscheidungData = {
          entscheidungsTyp: 'bestaetigen',
          interneNotiz: 'Angebot bestätigt',
          entscheidungGetroffen: true,
          entscheidungGetroffenAm: angebot.angebotsEingangAm || angebot.angefordertAm,
        }
      } else if (angebot.status === 'abgelehnt_versicherer') {
        entscheidungData = {
          entscheidungsTyp: 'ablehnen',
          ablehnungsgrund: angebot.ablehnungsgrund || 'Nicht spezifiziert',
          ablehnungsgrundDetailliert: 'Details zur Ablehnung',
          entscheidungGetroffen: true,
          entscheidungGetroffenAm: angebot.angebotsEingangAm || angebot.angefordertAm,
        }
      } else if (angebot.status === 'angenommen') {
        entscheidungData = {
          entscheidungsTyp: 'bestaetigen',
          interneNotiz: 'Angebot angenommen',
          entscheidungGetroffen: true,
          entscheidungGetroffenAm: angebot.angebotsEingangAm || angebot.angefordertAm,
        }
      }

      set({
        kalkulationData,
        entscheidungData,
      })
    })
  },

  reset: () =>
    set({
      currentVorquotierungId: null,
      currentAngebotId: null,
      activeTab: 'kunde-flotte',
      kalkulationData: initialKalkulationData,
      entscheidungData: initialEntscheidungData,
    }),
}))
