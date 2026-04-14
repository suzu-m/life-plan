import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Person = {
  name: string
  age: number | null
  relationship?: string
}

type FamilyStore = {
  inputValue: Map<number, Person>
  nextId: number

  createPerson: (value?: Person) => void
  updatePerson: (key: number, value: Partial<Person>) => void
  deletePerson: (key: number) => void
}

const init: Person = {
  name: '',
  age: null
}

export const useFamilyStore = create<FamilyStore>()(
  persist(
    (set) => ({
      inputValue: new Map([[0, init]]),
      nextId: 1,

      // CREATE
      createPerson: (value = init) => {
        set((state) => {
          const newMap = new Map(state.inputValue)
          newMap.set(state.nextId, value)

          return {
            inputValue: newMap,
            nextId: state.nextId + 1
          }
        })
      },

      // UPDATE
      updatePerson: (key, value) => {
        set((state) => {
          const current = state.inputValue.get(key)
          if (!current) return state

          const newMap = new Map(state.inputValue)
          newMap.set(key, { ...current, ...value })

          return { inputValue: newMap }
        })
      },

      // DELETE
      deletePerson: (key) => {
        set((state) => {
          const newMap = new Map(state.inputValue)
          newMap.delete(key)

          return { inputValue: newMap }
        })
      }
    }),
    {
      name: 'family-storage',

      // Mapを保存できるようにする
      partialize: (state) => ({
        inputValue: Array.from(state.inputValue.entries()),
        nextId: state.nextId
      }),

      onRehydrateStorage: () => (state) => {
        if (!state) return
        state.inputValue = new Map(state.inputValue)
      }
    }
  )
)
