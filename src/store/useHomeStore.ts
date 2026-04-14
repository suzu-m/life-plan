import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type HomeType = 'rental' | 'own'
export type LoanMode = 'single' | 'pair'
export type RateType = 'fixed' | 'variable' | ''

export type RentalPlanData = {
  fee: number | null
  renewalFee: number | null
  renewalFrequency: number | null
}

export type OwnLoan = {
  id: number
  name: string
  amount: number | null
  period: number | null
  rateType: RateType
  interestRate: number | null
}

export type OwnPlanData = {
  loanMode: LoanMode
  loans: OwnLoan[]
}

export type HomePlan = {
  id: number
  fromYear: number | null
  toYear: number | null
  type: HomeType
  rental: RentalPlanData
  own: OwnPlanData
}

type HomeStore = {
  plans: HomePlan[]
  draft: HomePlan
  nextPlanId: number

  updateDraft: (value: Partial<HomePlan>) => void
  updateDraftType: (type: HomeType) => void
  updateDraftRental: (value: Partial<RentalPlanData>) => void
  updateDraftLoanMode: (mode: LoanMode) => void
  updateDraftLoan: (loanId: number, value: Partial<OwnLoan>) => void
  addDraftPlan: () => void
  deletePlan: (planId: number) => void
  resetDraft: () => void
}

const getCurrentYear = () => new Date().getFullYear()

const createLoan = (id: number, name: string): OwnLoan => ({
  id,
  name,
  amount: null,
  period: null,
  rateType: '',
  interestRate: null
})

const createDraft = (id: number): HomePlan => {
  const currentYear = getCurrentYear()

  return {
    id,
    // 追加ボタンの判定と表示がずれないように、初期年は実値として持つ。
    fromYear: currentYear,
    toYear: currentYear,
    type: 'rental',
    rental: {
      fee: null,
      renewalFee: null,
      renewalFrequency: null
    },
    own: {
      loanMode: 'single',
      loans: [createLoan(0, 'ローン1')]
    }
  }
}

function sortPlans(plans: HomePlan[]) {
  return [...plans].sort((a, b) => {
    const fromYearA = a.fromYear ?? Number.MAX_SAFE_INTEGER
    const fromYearB = b.fromYear ?? Number.MAX_SAFE_INTEGER

    if (fromYearA !== fromYearB) {
      return fromYearA - fromYearB
    }

    const toYearA = a.toYear ?? Number.MAX_SAFE_INTEGER
    const toYearB = b.toYear ?? Number.MAX_SAFE_INTEGER

    if (toYearA !== toYearB) {
      return toYearA - toYearB
    }

    return a.id - b.id
  })
}

export const useHomeStore = create<HomeStore>()(
  persist(
    (set, get) => ({
      plans: [],
      draft: createDraft(0),
      nextPlanId: 1,

      updateDraft: (value) => {
        set((state) => ({
          draft: {
            ...state.draft,
            ...value
          }
        }))
      },

      updateDraftType: (type) => {
        set((state) => ({
          draft: {
            ...state.draft,
            type
          }
        }))
      },

      updateDraftRental: (value) => {
        set((state) => ({
          draft: {
            ...state.draft,
            rental: {
              ...state.draft.rental,
              ...value
            }
          }
        }))
      },

      updateDraftLoanMode: (loanMode) => {
        set((state) => ({
          draft: {
            ...state.draft,
            own: {
              ...state.draft.own,
              loanMode,
              // ペアローンに切り替えたら2本分の入力欄を用意する。
              loans:
                loanMode === 'pair'
                  ? [createLoan(0, '主債務者'), createLoan(1, '配偶者')]
                  : [state.draft.own.loans[0] ?? createLoan(0, 'ローン1')]
            }
          }
        }))
      },

      updateDraftLoan: (loanId, value) => {
        set((state) => ({
          draft: {
            ...state.draft,
            own: {
              ...state.draft.own,
              loans: state.draft.own.loans.map((loan) =>
                loan.id === loanId ? { ...loan, ...value } : loan
              )
            }
          }
        }))
      },

      addDraftPlan: () => {
        const { draft, nextPlanId } = get()
        set((state) => ({
          // 削除後に再追加しても順序が崩れないよう、開始年の古い順に保つ。
          plans: sortPlans([...state.plans, draft]),
          // 登録後は次の期間をすぐ入力できるよう、新しいドラフトを作り直す。
          draft: createDraft(nextPlanId),
          nextPlanId: nextPlanId + 1
        }))
      },

      deletePlan: (planId) => {
        set((state) => ({
          plans: state.plans.filter((plan) => plan.id !== planId)
        }))
      },

      resetDraft: () => {
        const { nextPlanId } = get()
        set({
          draft: createDraft(nextPlanId)
        })
      }
    }),
    {
      name: 'home-storage'
    }
  )
)
