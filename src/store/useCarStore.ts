import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CarPlan = {
  name: string
  purchaseYear: number | null

  // ローン関連
  loanPayments: number | null // ローン支払回数（月数）
  loanMonthlyAmount: number | null // 月々のローン支払額（万円）

  // 残価設定型クレジット（残クレ）関連
  hasZankure: boolean // 残クレを利用するかどうか
  zankureFinalAmount: number | null // 残価・最終支払額（万円）

  // 維持費関連
  isNewCar: boolean // 新車かどうか（車検サイクルの判定用）
  shakenAmount: number | null // 車検代（1回あたり/万円）
  taxYearlyAmount: number | null // 自動車税（年額/万円）
  maintenanceYearlyAmount: number | null // 保険・ガソリン等その他維持費（年額/万円）

  // 計算用
  carPrice: number | null // 車の総額（万円）
  downPayment: number | null // 頭金（万円）
  loanInterestRate: number | null // ローン利率（%）
}

type CarStore = {
  cars: Map<number, CarPlan>
  draft: CarPlan
  editingCarId: number | null
  nextId: number

  updateDraft: (value: Partial<CarPlan>) => void
  saveDraftCar: () => void
  editCar: (carId: number) => void
  deleteCar: (carId: number) => void
  resetDraft: () => void
}

const initCar: CarPlan = {
  name: '',
  purchaseYear: null,
  loanPayments: null,
  loanMonthlyAmount: null,
  hasZankure: false,
  zankureFinalAmount: null,
  isNewCar: true,
  shakenAmount: null,
  taxYearlyAmount: null,
  maintenanceYearlyAmount: null,
  carPrice: null,
  downPayment: null,
  loanInterestRate: null
}

function cloneCar(car: CarPlan): CarPlan {
  return { ...car }
}

export const useCarStore = create<CarStore>()(
  persist(
    (set, get) => ({
      cars: new Map(),
      draft: cloneCar(initCar),
      editingCarId: null,
      nextId: 0,

      updateDraft: (value) => {
        set((state) => ({
          draft: {
            ...state.draft,
            ...value
          }
        }))
      },

      saveDraftCar: () => {
        const { draft, editingCarId, nextId } = get()

        set((state) => {
          if (editingCarId !== null) {
            const nextCars = new Map(state.cars)
            nextCars.set(editingCarId, cloneCar(draft))

            return {
              cars: nextCars,
              draft: cloneCar(initCar),
              editingCarId: null
            }
          }

          const nextCars = new Map(state.cars)
          nextCars.set(nextId, cloneCar(draft))

          return {
            cars: nextCars,
            draft: cloneCar(initCar),
            editingCarId: null,
            nextId: nextId + 1
          }
        })
      },

      editCar: (carId) => {
        set((state) => {
          const car = state.cars.get(carId)

          if (!car) {
            return state
          }

          return {
            draft: cloneCar(car),
            editingCarId: carId
          }
        })
      },

      deleteCar: (carId) => {
        set((state) => {
          const nextCars = new Map(state.cars)
          nextCars.delete(carId)

          return {
            cars: nextCars,
            ...(state.editingCarId === carId
              ? {
                  draft: cloneCar(initCar),
                  editingCarId: null
                }
              : {})
          }
        })
      },

      resetDraft: () => {
        set({
          draft: cloneCar(initCar),
          editingCarId: null
        })
      }
    }),
    {
      name: 'car-storage',
      partialize: (state) => ({
        cars: Array.from(state.cars.entries()),
        draft: state.draft,
        editingCarId: state.editingCarId,
        nextId: state.nextId
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        state.cars = new Map(state.cars)
      }
    }
  )
)
