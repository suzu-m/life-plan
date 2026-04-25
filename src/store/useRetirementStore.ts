import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type RetirementPlan = {
  selfPensionMonthly: number      // 本人の年金（月額・万円）
  selfPensionStartAge: number     // 受給開始年齢
  spousePensionMonthly: number    // 配偶者の年金（月額・万円）
  spousePensionStartAge: number   // 受給開始年齢
  retirementLivingExpenseMonthly: number // 老後の生活費（月額・万円）
}

interface RetirementState extends RetirementPlan {
  setRetirement: (data: Partial<RetirementPlan>) => void
}

const initialRetirement: RetirementPlan = {
  selfPensionMonthly: 15,
  selfPensionStartAge: 65,
  spousePensionMonthly: 10,
  spousePensionStartAge: 65,
  retirementLivingExpenseMonthly: 20
}

export const useRetirementStore = create<RetirementState>()(
  persist(
    (set) => ({
      ...initialRetirement,
      setRetirement: (data) => set((state) => ({ ...state, ...data }))
    }),
    {
      name: 'retirement-store'
    }
  )
)
