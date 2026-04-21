import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Occupation = 'employee' | 'self-employed' | 'other' | ''

export type MemberIncome = {
  occupation: Occupation
  annualSalary: number | null        // 年収（万円）
  retirementAllowance: number | null // 退職金（万円）
  retirementAge: number | null       // 退職年齢（会社員のみ）
}

export type Assets = {
  bankSavings: number | null      // 銀行預金
  nisa: number | null             // NISA
  ideco: number | null            // iDeCo
  otherInvestments: number | null // その他投資
}

type IncomeStore = {
  main: MemberIncome
  partner: MemberIncome
  assets: Assets
  passiveIncome: number | null    // 不労所得（年額・万円）

  updateMain: (value: Partial<MemberIncome>) => void
  updatePartner: (value: Partial<MemberIncome>) => void
  updateAssets: (value: Partial<Assets>) => void
  updatePassiveIncome: (value: number | null) => void
  reset: () => void
}

const initialMemberIncome: MemberIncome = {
  occupation: '',
  annualSalary: null,
  retirementAllowance: null,
  retirementAge: 60
}

const initialAssets: Assets = {
  bankSavings: null,
  nisa: null,
  ideco: null,
  otherInvestments: null
}

export const useIncomeStore = create<IncomeStore>()(
  persist(
    (set) => ({
      main: { ...initialMemberIncome },
      partner: { ...initialMemberIncome },
      assets: { ...initialAssets },
      passiveIncome: null,

      updateMain: (value) =>
        set((state) => ({
          main: { ...state.main, ...value }
        })),
      updatePartner: (value) =>
        set((state) => ({
          partner: { ...state.partner, ...value }
        })),
      updateAssets: (value) =>
        set((state) => ({
          assets: { ...state.assets, ...value }
        })),
      updatePassiveIncome: (value) =>
        set({ passiveIncome: value }),

      reset: () =>
        set({
          main: { ...initialMemberIncome },
          partner: { ...initialMemberIncome },
          assets: { ...initialAssets },
          passiveIncome: null
        })
    }),
    {
      name: 'income-storage'
    }
  )
)
