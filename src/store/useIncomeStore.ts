import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Occupation = 'employee' | 'self-employed' | 'other' | ''

export type ShortTimePeriod = {
  id: number
  startYear: number // 開始年度
  endYear: number   // 終了年度
  rate: number      // 給与支払率 (%)
}

export type LeavePeriod = {
  id: number
  year: number // 年度
  months: number // その年の休暇月数 (1-12)
  rate: number // 給与補填率 (%)
}

export type MemberIncome = {
  occupation: Occupation
  annualSalary: number | null        // 年収（万円）
  retirementAllowance: number | null // 退職金（万円）
  retirementAge: number | null       // 退職年齢（会社員のみ）
  salaryIncreaseType: 'amount' | 'rate' // 昇給の種類
  salaryIncreaseValue: number | null    // 昇給の額（万円）または率（%）
  leavePeriods: LeavePeriod[] // 産休・育休期間
  shortTimePeriods: ShortTimePeriod[] // 時短勤務期間
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
  retirementAge: 60,
  salaryIncreaseType: 'rate',
  salaryIncreaseValue: 0,
  leavePeriods: [],
  shortTimePeriods: []
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
