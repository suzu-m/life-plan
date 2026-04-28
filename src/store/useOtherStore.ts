import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type OtherExpense = {
  id: number
  title: string
  amount: number | null // 万円
  startYear: number | null // 開始年
  endYear: number | null // 終了年
  frequency: number | null // 頻度（年おき、1なら毎年、0なら単発）
}

type OtherStore = {
  expenses: Map<number, OtherExpense>
  draft: OtherExpense
  editingId: number | null
  nextId: number

  updateDraft: (value: Partial<OtherExpense>) => void
  saveDraft: () => void
  editExpense: (id: number) => void
  deleteExpense: (id: number) => void
  resetDraft: () => void
}

const initialDraft: OtherExpense = {
  id: 0,
  title: '',
  amount: null,
  startYear: new Date().getFullYear(),
  endYear: null,
  frequency: 1
}

/**
 * ストアの状態をクローンするユーティリティ
 */
const cloneExpense = (expense: OtherExpense): OtherExpense => ({
  ...expense
})

export const useOtherStore = create<OtherStore>()(
  persist(
    (set, get) => ({
      expenses: new Map(),
      draft: cloneExpense(initialDraft),
      editingId: null,
      nextId: 0,

      updateDraft: (value) => {
        set((state) => ({
          draft: { ...state.draft, ...value }
        }))
      },

      saveDraft: () => {
        const { draft, editingId, nextId } = get()
        set((state) => {
          const nextExpenses = new Map(state.expenses)
          if (editingId !== null) {
            nextExpenses.set(editingId, cloneExpense(draft))
            return {
              expenses: nextExpenses,
              draft: cloneExpense(initialDraft),
              editingId: null
            }
          }
          nextExpenses.set(nextId, cloneExpense({ ...draft, id: nextId }))
          return {
            expenses: nextExpenses,
            draft: cloneExpense(initialDraft),
            nextId: nextId + 1
          }
        })
      },

      editExpense: (id) => {
        set((state) => {
          const expense = state.expenses.get(id)
          if (!expense) return state
          return {
            draft: cloneExpense(expense),
            editingId: id
          }
        })
      },

      deleteExpense: (id) => {
        set((state) => {
          const nextExpenses = new Map(state.expenses)
          nextExpenses.delete(id)
          return {
            expenses: nextExpenses,
            ...(state.editingId === id ? { editingId: null, draft: cloneExpense(initialDraft) } : {})
          }
        })
      },

      resetDraft: () => {
        set({
          draft: cloneExpense(initialDraft),
          editingId: null
        })
      }
    }),
    {
      name: 'other-expense-storage',
      partialize: (state) => ({
        expenses: Array.from(state.expenses.entries()),
        nextId: state.nextId
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        state.expenses = new Map(state.expenses)
      }
    }
  )
)
