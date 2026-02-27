import { create } from 'zustand'

export type WorkflowStep = 1 | 2 | 3 | 4 | 5 | 6

// Tab 1: Kundendaten
export interface KundenData {
  // Firma
  firmenname?: string
  rechtsform?: string
  branche?: string

  // Adresse
  strasse?: string
  plz?: string
  ort?: string
  land?: string

  // Kontakt
  telefon?: string
  email?: string
  website?: string

  // Ansprechpartner
  ansprechpartner?: string
  ansprechpartnerPosition?: string
  ansprechpartnerTelefon?: string
  ansprechpartnerEmail?: string

  // Unternehmensdaten
  handelsregister?: string
  amtsgericht?: string
  ustIdNr?: string
  gruendungsjahr?: number
  anzahlMitarbeiter?: number
  jahresumsatz?: number

  // ID wenn Kunde bereits existiert
  existingKundeId?: string
}

// Tab 2: Flottendaten
export interface FahrzeugData {
  id: string
  kennzeichen: string
  fahrzeugtyp: 'PKW' | 'Transporter' | 'LKW' | 'Sattelzugmaschine' | 'Anhänger'
  hersteller: string
  modell: string
  erstzulassung: string
  neuwert: number
  zeitwert: number
  nutzungsart: string
}

export interface FlottenData {
  fahrzeuge: FahrzeugData[]
  importMethod?: 'excel' | 'manual'
  excelFileName?: string
}

// Tab 3: Schadensverlauf (optional)
export interface SchadensverlaufData {
  // Renta-Daten
  hasRenta: boolean
  rentaFileName?: string
  rentaJahre?: Array<{
    jahr: number
    bruttopraMie: number
    schadenaufwand: number
    schadenquote: number
  }>

  // ESA-Daten
  hasESA: boolean
  esaFileName?: string
  esaSchaeden?: Array<{
    schadennummer: string
    schadendatum: string
    schadenart: string
    schadenhoehe: number
    status: string
  }>
}

// Tab 4: Gewünschte Deckungen
export interface DeckungData {
  // Produktauswahl
  haftpflicht: boolean
  vollkasko: boolean
  teilkasko: boolean
  insassenUnfall: boolean
  schutzbrief: boolean
  fahrerrechtsschutz: boolean

  // Deckungsparameter
  deckungssummeHaftpflicht?: number
  selbstbeteiligungVollkasko?: number
  selbstbeteiligungTeilkasko?: number

  // Versicherungsbeginn
  versicherungsbeginn?: string
}

// Tab 5: Angebot anfragen
export interface AnfrageData {
  // Optionale Angaben
  nettoisierung: boolean
  alternativangebote: boolean
  notizen?: string

  // Wird beim Absenden gesetzt
  eingereichtAm?: string
  anfrageNummer?: string
}

// Tab 6: Angebot annehmen
export interface AngebotData {
  // Angenommenes Angebot
  angenommenesAngebotId?: string

  // Rechnungsempfänger
  rechnungsempfaenger?: {
    firma: string
    strasse: string
    plz: string
    ort: string
  }

  // SEPA-Mandat
  iban?: string
  bic?: string
  kontoinhaber?: string
  zahlungsweise?: 'jaehrlich' | 'halbjaehrlich' | 'vierteljaehrlich' | 'monatlich'
}

interface MaklerAnfrageState {
  // Current step
  currentStep: WorkflowStep
  setStep: (step: WorkflowStep) => void
  nextStep: () => void
  prevStep: () => void

  // Tab completion tracking
  completedSteps: Set<WorkflowStep>
  markStepCompleted: (step: WorkflowStep) => void
  isStepCompleted: (step: WorkflowStep) => boolean

  // Form data
  kundenData: Partial<KundenData> | null
  flottenData: Partial<FlottenData> | null
  schadensverlaufData: Partial<SchadensverlaufData> | null
  deckungData: Partial<DeckungData> | null
  anfrageData: Partial<AnfrageData> | null
  angebotData: Partial<AngebotData> | null

  // Update actions
  updateKundenData: (data: Partial<KundenData>) => void
  updateFlottenData: (data: Partial<FlottenData>) => void
  updateSchadensverlaufData: (data: Partial<SchadensverlaufData>) => void
  updateDeckungData: (data: Partial<DeckungData>) => void
  updateAnfrageData: (data: Partial<AnfrageData>) => void
  updateAngebotData: (data: Partial<AngebotData>) => void

  // Fahrzeug management
  addFahrzeug: (fahrzeug: FahrzeugData) => void
  removeFahrzeug: (fahrzeugId: string) => void
  updateFahrzeug: (fahrzeugId: string, data: Partial<FahrzeugData>) => void

  // Load existing anfrage
  loadAnfrage: (anfrageId: string) => void

  // Reset
  resetForm: () => void
}

const initialState = {
  currentStep: 1 as WorkflowStep,
  completedSteps: new Set<WorkflowStep>(),
  kundenData: null,
  flottenData: { fahrzeuge: [] },
  schadensverlaufData: { hasRenta: false, hasESA: false },
  deckungData: {
    haftpflicht: true,
    vollkasko: false,
    teilkasko: false,
    insassenUnfall: false,
    schutzbrief: false,
    fahrerrechtsschutz: false,
  },
  anfrageData: { nettoisierung: false, alternativangebote: false },
  angebotData: null,
}

export const useMaklerAnfrageStore = create<MaklerAnfrageState>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),

  nextStep: () => {
    const { currentStep } = get()
    if (currentStep < 6) {
      set({ currentStep: (currentStep + 1) as WorkflowStep })
    }
  },

  prevStep: () => {
    const { currentStep } = get()
    if (currentStep > 1) {
      set({ currentStep: (currentStep - 1) as WorkflowStep })
    }
  },

  markStepCompleted: (step) =>
    set((state) => ({
      completedSteps: new Set(state.completedSteps).add(step),
    })),

  isStepCompleted: (step) => get().completedSteps.has(step),

  updateKundenData: (data) =>
    set((state) => ({
      kundenData: { ...state.kundenData, ...data },
    })),

  updateFlottenData: (data) =>
    set((state) => ({
      flottenData: { ...state.flottenData, ...data },
    })),

  updateSchadensverlaufData: (data) =>
    set((state) => ({
      schadensverlaufData: { ...state.schadensverlaufData, ...data },
    })),

  updateDeckungData: (data) =>
    set((state) => ({
      deckungData: { ...state.deckungData, ...data },
    })),

  updateAnfrageData: (data) =>
    set((state) => ({
      anfrageData: { ...state.anfrageData, ...data },
    })),

  updateAngebotData: (data) =>
    set((state) => ({
      angebotData: { ...state.angebotData, ...data },
    })),

  addFahrzeug: (fahrzeug) =>
    set((state) => ({
      flottenData: {
        ...state.flottenData,
        fahrzeuge: [...(state.flottenData?.fahrzeuge || []), fahrzeug],
      },
    })),

  removeFahrzeug: (fahrzeugId) =>
    set((state) => ({
      flottenData: {
        ...state.flottenData,
        fahrzeuge: (state.flottenData?.fahrzeuge || []).filter((f) => f.id !== fahrzeugId),
      },
    })),

  updateFahrzeug: (fahrzeugId, data) =>
    set((state) => ({
      flottenData: {
        ...state.flottenData,
        fahrzeuge: (state.flottenData?.fahrzeuge || []).map((f) =>
          f.id === fahrzeugId ? { ...f, ...data } : f
        ),
      },
    })),

  loadAnfrage: (anfrageId) => {
    // Import wird dynamisch gemacht, um zirkuläre Abhängigkeiten zu vermeiden
    import('@/stores/demo-data/anfragen').then(({ anfragen }) => {
      import('@/stores/demo-data/musterfirma-flotte').then(({ musterfirmaFlotte }) => {
        import('@/stores/demo-data/musterfirma-renta').then(({ musterfirmaRentaJahre }) => {
          const anfrage = anfragen.find((a) => a.id === anfrageId)
          if (!anfrage) return

          // Map workflow steps to completed steps
          const completedSteps = new Set<WorkflowStep>()
          anfrage.workflow.forEach((step, index) => {
            if (step.status === 'abgeschlossen') {
              completedSteps.add((index + 1) as WorkflowStep)
            }
          })

          // Map Kundendaten
          const kundenData: Partial<KundenData> = {
            existingKundeId: anfrage.kundeId,
            firmenname: anfrage.kunde.firmenname,
            rechtsform: anfrage.kunde.rechtsform,
            branche: anfrage.kunde.branche,
            strasse: anfrage.kunde.strasse,
            plz: anfrage.kunde.plz,
            ort: anfrage.kunde.ort,
            land: anfrage.kunde.land || 'Deutschland',
            telefon: anfrage.kunde.telefon,
            email: anfrage.kunde.email,
            website: anfrage.kunde.website,
            ansprechpartner: anfrage.kunde.ansprechpartner,
            ansprechpartnerEmail: anfrage.kunde.email,
            handelsregister: anfrage.kunde.handelsregister,
            amtsgericht: anfrage.kunde.amtsgericht,
            ustIdNr: anfrage.kunde.ustIdNr,
            gruendungsjahr: anfrage.kunde.gruendungsjahr,
            anzahlMitarbeiter: anfrage.kunde.anzahlMitarbeiter,
            jahresumsatz: anfrage.kunde.jahresumsatz,
          }

          // Map Flottendaten (für ANF-2025-0001: erste 5 Fahrzeuge)
          const fahrzeuge: FahrzeugData[] = musterfirmaFlotte.slice(0, anfrage.anzahlFahrzeuge).map((fzg) => ({
            id: fzg.id,
            kennzeichen: fzg.kennzeichen,
            fahrzeugtyp: fzg.fahrzeugtyp,
            hersteller: fzg.hersteller,
            modell: fzg.modell,
            erstzulassung: fzg.erstzulassung,
            neuwert: 50000, // Schätzwert
            zeitwert:
              fzg.jahrespraemieHaftpflicht +
              (fzg.jahrespraemieVollkasko || 0) +
              (fzg.jahrespraemieTeilkasko || 0),
            nutzungsart: fzg.nutzungsart,
          }))

          const flottenData: Partial<FlottenData> = {
            fahrzeuge,
            importMethod: 'manual',
          }

          // Map Schadensverlauf
          const schadensverlaufData: Partial<SchadensverlaufData> = {
            hasRenta: true,
            rentaFileName: 'Renta_Musterfirma_2022-2024.pdf',
            rentaJahre: musterfirmaRentaJahre.slice(-3).map((jahr) => ({
              jahr: jahr.jahr,
              bruttopraMie: jahr.bruttoJahrespraemie,
              schadenaufwand: jahr.schadenaufwand,
              schadenquote: jahr.schadenquote,
            })),
            hasESA: false,
          }

          // Map Deckung (Annahme: gleiche Deckungen wie Hauptvertrag)
          const deckungData: Partial<DeckungData> = {
            haftpflicht: true,
            vollkasko: true,
            teilkasko: true,
            insassenUnfall: false,
            schutzbrief: false,
            fahrerrechtsschutz: false,
            deckungssummeHaftpflicht: 100000000,
            selbstbeteiligungVollkasko: 500,
            selbstbeteiligungTeilkasko: 150,
            versicherungsbeginn: anfrage.versicherungsbeginn,
          }

          // Map Anfragedaten
          const anfrageData: Partial<AnfrageData> = {
            nettoisierung: false,
            alternativangebote: false,
            notizen: [
              anfrage.kundenwuensche && `Kundenwünsche: ${anfrage.kundenwuensche}`,
              anfrage.besonderheiten && `Besonderheiten: ${anfrage.besonderheiten}`,
              anfrage.interneNotizen && `Interne Notizen: ${anfrage.interneNotizen}`,
            ]
              .filter(Boolean)
              .join('\n\n'),
            eingereichtAm: anfrage.eingereichtAm,
            anfrageNummer: anfrage.anfrageNummer,
          }

          // Set all data
          set({
            currentStep: anfrage.aktuellerSchritt as WorkflowStep,
            completedSteps,
            kundenData,
            flottenData,
            schadensverlaufData,
            deckungData,
            anfrageData,
            angebotData: null,
          })
        })
      })
    })
  },

  resetForm: () => set({ ...initialState, completedSteps: new Set() }),
}))
