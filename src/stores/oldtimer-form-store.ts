import { create } from 'zustand'
import type {
  VehicleData,
  UsageData,
  DriverHistory,
  TariffSelection,
  InsuranceStartDate,
  PersonalData,
} from '@/apps/portal-1/features/oldtimer-versicherung/data/schema'
import { calculatePremium } from '@/apps/portal-1/features/oldtimer-versicherung/data/tariffs'

export type FormStep = 1 | 2 | 3 | 4 | 5 | 'confirmation-pending' | 'confirmation-success'

interface OldtimerFormState {
  // Current step
  currentStep: FormStep
  setStep: (step: FormStep) => void
  nextStep: () => void
  prevStep: () => void

  // Form data
  vehicleData: Partial<VehicleData> | null
  usageData: Partial<UsageData> | null
  driverHistory: Partial<DriverHistory> | null
  tariffSelection: Partial<TariffSelection> | null
  insuranceStartDate: Partial<InsuranceStartDate> | null
  personalData: Partial<PersonalData> | null

  // Update actions
  updateVehicleData: (data: Partial<VehicleData>) => void
  updateUsageData: (data: Partial<UsageData>) => void
  updateDriverHistory: (data: Partial<DriverHistory>) => void
  updateTariffSelection: (data: Partial<TariffSelection>) => void
  updateInsuranceStartDate: (data: Partial<InsuranceStartDate>) => void
  updatePersonalData: (data: Partial<PersonalData>) => void

  // Reset
  resetForm: () => void

  // Calculated premium
  calculateAndUpdatePremium: () => void
}

const initialState = {
  currentStep: 1 as FormStep,
  vehicleData: null,
  usageData: null,
  driverHistory: null,
  tariffSelection: null,
  insuranceStartDate: null,
  personalData: null,
}

export const useOldtimerFormStore = create<OldtimerFormState>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),

  nextStep: () => {
    const { currentStep } = get()
    if (currentStep === 5) {
      set({ currentStep: 'confirmation-pending' })
    } else if (currentStep !== 'confirmation-pending' && currentStep !== 'confirmation-success') {
      set({ currentStep: (parseInt(String(currentStep)) + 1) as FormStep })
    }
  },

  prevStep: () => {
    const { currentStep } = get()
    if (currentStep === 'confirmation-pending') {
      set({ currentStep: 5 })
    } else if (currentStep !== 'confirmation-success' && currentStep > 1) {
      set({ currentStep: (parseInt(String(currentStep)) - 1) as FormStep })
    }
  },

  updateVehicleData: (data) =>
    set((state) => ({
      vehicleData: { ...state.vehicleData, ...data },
    })),

  updateUsageData: (data) =>
    set((state) => ({
      usageData: { ...state.usageData, ...data },
    })),

  updateDriverHistory: (data) =>
    set((state) => ({
      driverHistory: { ...state.driverHistory, ...data },
    })),

  updateTariffSelection: (data) =>
    set((state) => ({
      tariffSelection: { ...state.tariffSelection, ...data },
    })),

  updateInsuranceStartDate: (data) =>
    set((state) => ({
      insuranceStartDate: { ...state.insuranceStartDate, ...data },
    })),

  updatePersonalData: (data) =>
    set((state) => ({
      personalData: { ...state.personalData, ...data },
    })),

  calculateAndUpdatePremium: () => {
    const { vehicleData, usageData, driverHistory, tariffSelection } = get()

    if (!vehicleData || !usageData || !tariffSelection) return

    const mileageMap: Record<string, string> = {
      '3000': '3k',
      '6000': '6k',
      '9000': '9k',
      '12000': '12k',
    }

    const mileage = mileageMap[usageData.annualMileage as string] || '12k'
    const driverAge = driverHistory?.minimumAge ?? 25
    const hasClaimsHistory = (driverHistory?.previousClaimsCount ?? 0) > 0

    const premium = calculatePremium(
      tariffSelection.selectedTariff || 'komfort',
      vehicleData.value || 50000,
      mileage,
      driverAge,
      hasClaimsHistory
    )

    set((state) => ({
      tariffSelection: {
        ...state.tariffSelection,
        annualPremium: premium.annual,
        monthlyPremium: premium.monthly,
      },
    }))
  },

  resetForm: () => set(initialState),
}))
