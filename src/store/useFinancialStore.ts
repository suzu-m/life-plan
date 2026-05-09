import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type InvestmentPlan = {
  id: number
  startYear: number
  endYear: number | null
  monthlyAmount: number // 万円
}

export type FinancialStore = {
  // 投資資産の現在残高（IncomeStoreから移動）
  nisaInitial: number | null
  idecoInitial: number | null
  otherInvestmentsInitial: number | null

  investmentYield: number | null     // 期待運用利回り (%)
  investmentPlans: InvestmentPlan[]  // 積立投資プラン

  furusatoNozeiAmount: number | null // ふるさと納税 (万円/年)
  mortgageDeductionEnabled: boolean  // 住宅ローン控除を考慮するか
  otherDeductionsAmount: number | null // その他控除 (万円/年)

  updateSettings: (value: Partial<Omit<FinancialStore, 'updateSettings' | 'reset'>>) => void
  reset: () => void
}

const initialSettings = {
  nisaInitial: null,
  idecoInitial: null,
  otherInvestmentsInitial: null,
  investmentYield: 3,
  investmentPlans: [],
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
