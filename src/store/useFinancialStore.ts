import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type FinancialStore = {
  investmentYield: number | null     // 期待運用利回り (%)
  furusatoNozeiAmount: number | null // ふるさと納税 (万円/年)
  mortgageDeductionEnabled: boolean  // 住宅ローン控除を考慮するか
  otherDeductionsAmount: number | null // その他控除 (万円/年)

  updateSettings: (value: Partial<Omit<FinancialStore, 'updateSettings' | 'reset'>>) => void
  reset: () => void
}

const initialSettings = {
  investmentYield: 3,                // デフォルト 3%
  furusatoNozeiAmount: null,
  mortgageDeductionEnabled: true,
  otherDeductionsAmount: null
}

export const useFinancialStore = create<FinancialStore>()(
  persist(
    (set) => ({
      ...initialSettings,

      updateSettings: (value) =>
        set((state) => ({
          ...state,
          ...value
        })),

      reset: () => set({ ...initialSettings })
    }),
    {
      name: 'financial-storage'
    }
  )
)
