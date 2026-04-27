import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const STORE_KEYS = [
  'family-storage',
  'income-storage',
  'home-storage',
  'child-storage',
  'car-storage',
  'living-storage',
  'other-storage',
  'retirement-storage'
] as const

export type Scenario = {
  id: string
  name: string
  createdAt: number
  data: Record<string, string | null> // LocalStorageのキーに対するJSON文字列（取得できない場合はnull）
}

type ScenarioStore = {
  scenarios: Scenario[]
  saveScenario: (name: string) => void
  updateScenario: (id: string) => void
  loadScenario: (id: string) => void
  deleteScenario: (id: string) => void
}

export const useScenarioStore = create<ScenarioStore>()(
  persist(
    (set, get) => ({
      scenarios: [],

      saveScenario: (name: string) => {
        const data: Record<string, string | null> = {}
        STORE_KEYS.forEach((key) => {
          data[key] = localStorage.getItem(key)
        })

        const newScenario: Scenario = {
          id: crypto.randomUUID(),
          name,
          createdAt: Date.now(),
          data
        }

        set((state) => ({
          scenarios: [...state.scenarios, newScenario]
        }))
      },

      updateScenario: (id: string) => {
        const data: Record<string, string | null> = {}
        STORE_KEYS.forEach((key) => {
          data[key] = localStorage.getItem(key)
        })

        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.id === id
              ? {
                  ...s,
                  data,
                  createdAt: Date.now()
                }
              : s
          )
        }))
      },

      loadScenario: (id: string) => {
        const { scenarios } = get()
        const target = scenarios.find((s) => s.id === id)
        if (!target) return

        // 記録されているデータをすべて LocalStorage に上書き
        STORE_KEYS.forEach((key) => {
          const storedValue = target.data[key]
          if (storedValue !== null && storedValue !== undefined) {
            localStorage.setItem(key, storedValue)
          } else {
            localStorage.removeItem(key)
          }
        })

        // 全ての状態を再構築するためリロード
        window.location.reload()
      },

      deleteScenario: (id: string) => {
        set((state) => ({
          scenarios: state.scenarios.filter((s) => s.id !== id)
        }))
      }
    }),
    {
      name: 'scenario-storage'
    }
  )
)
