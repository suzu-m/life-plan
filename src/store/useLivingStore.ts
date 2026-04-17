import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type LivingPlan = {
  foodMonthlyAmount: number | null
  utilitiesMonthlyAmount: number | null
  telecomMonthlyAmount: number | null
  insuranceMonthlyAmount: number | null
  hobbiesMonthlyAmount: number | null
  otherMonthlyAmount: number | null
  allowanceMainMonthlyAmount: number | null
  allowancePartnerMonthlyAmount: number | null
}

type LivingStore = {
  plan: LivingPlan
  updatePlan: (value: Partial<LivingPlan>) => void
  resetPlan: () => void
}

const defaultPlan: LivingPlan = {
  foodMonthlyAmount: null,
  utilitiesMonthlyAmount: null,
  telecomMonthlyAmount: null,
  insuranceMonthlyAmount: null,
  hobbiesMonthlyAmount: null,
  otherMonthlyAmount: null,
  allowanceMainMonthlyAmount: null,
  allowancePartnerMonthlyAmount: null
}

export const useLivingStore = create<LivingStore>()(
  persist(
    (set) => ({
      plan: { ...defaultPlan },
      updatePlan: (value) =>
        set((state) => ({
          plan: {
            ...state.plan,
            ...value
          }
        })),
      resetPlan: () => set({ plan: { ...defaultPlan } })
    }),
    {
      name: 'living-storage'
    }
  )
)
