import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Person = {
  name: string
  age: number | null
  relationship: string
}

type FamilyStore = {
  people: Map<number, Person>
  draft: Person
  editingPersonId: number | null
  nextId: number

  updateDraft: (value: Partial<Person>) => void
  saveDraftPerson: () => void
  editPerson: (personId: number) => void
  deletePerson: (personId: number) => void
  resetDraft: () => void
}

const initPerson: Person = {
  name: '',
  age: null,
  relationship: ''
}

function clonePerson(person: Person): Person {
  return {
    ...person
  }
}

export const useFamilyStore = create<FamilyStore>()(
  persist(
    (set, get) => ({
      people: new Map(),
      draft: clonePerson(initPerson),
      editingPersonId: null,
      nextId: 0,

      updateDraft: (value) => {
        set((state) => ({
          draft: {
            ...state.draft,
            ...value
          }
        }))
      },

      saveDraftPerson: () => {
        const { draft, editingPersonId, nextId } = get()

        set((state) => {
          if (editingPersonId !== null) {
            const nextPeople = new Map(state.people)
            nextPeople.set(editingPersonId, clonePerson(draft))

            return {
              people: nextPeople,
              draft: clonePerson(initPerson),
              editingPersonId: null
            }
          }

          const nextPeople = new Map(state.people)
          nextPeople.set(nextId, clonePerson(draft))

          return {
            people: nextPeople,
            draft: clonePerson(initPerson),
            editingPersonId: null,
            nextId: nextId + 1
          }
        })
      },

      editPerson: (personId) => {
        set((state) => {
          const person = state.people.get(personId)

          if (!person) {
            return state
          }

          return {
            draft: clonePerson(person),
            editingPersonId: personId
          }
        })
      },

      deletePerson: (personId) => {
        set((state) => {
          const nextPeople = new Map(state.people)
          nextPeople.delete(personId)

          return {
            people: nextPeople,
            ...(state.editingPersonId === personId
              ? {
                  draft: clonePerson(initPerson),
                  editingPersonId: null
                }
              : {})
          }
        })
      },

      resetDraft: () => {
        set({
          draft: clonePerson(initPerson),
          editingPersonId: null
        })
      }
    }),
    {
      name: 'family-storage',
      partialize: (state) => ({
        people: Array.from(state.people.entries()),
        draft: state.draft,
        editingPersonId: state.editingPersonId,
        nextId: state.nextId
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        state.people = new Map(state.people)
      }
    }
  )
)
