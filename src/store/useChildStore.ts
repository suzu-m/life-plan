import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SchoolType = 'public' | 'private' | ''
export type EarlyEducationType = 'none' | 'nursery' | 'kindergarten'
export type HigherEducationType = 'none' | 'university' | 'juniorCollege' | 'vocational' | ''
export type UniversityType = 'national-public' | 'private' | ''
export type UniversityMajorType = 'liberalArts' | 'science' | 'medical' | ''

export type ChildLifeEvent = {
  id: number
  title: string
  age: number | null
  amount: number | null
}

export type ChildExpensePlan = {
  earlyEducationType: EarlyEducationType
  earlyEducationStartAge: number | null
  elementarySchoolType: SchoolType
  juniorHighSchoolType: SchoolType
  highSchoolType: SchoolType
  higherEducationType: HigherEducationType
  universityType: UniversityType
  universityMajorType: UniversityMajorType
  lifeEvents: ChildLifeEvent[]
  nextLifeEventId: number
}

type ChildStore = {
  plans: Map<number, ChildExpensePlan>
  updatePlan: (personId: number, value: Partial<ChildExpensePlan>) => void
  updateLifeEvent: (personId: number, eventId: number, value: Partial<ChildLifeEvent>) => void
  addLifeEvent: (personId: number) => void
  deleteLifeEvent: (personId: number, eventId: number) => void
}

function createDefaultPlan(): ChildExpensePlan {
  return {
    earlyEducationType: 'none',
    earlyEducationStartAge: null,
    elementarySchoolType: 'public',
    juniorHighSchoolType: 'public',
    highSchoolType: 'public',
    higherEducationType: 'none',
    universityType: '',
    universityMajorType: '',
    lifeEvents: [],
    nextLifeEventId: 0
  }
}

function clonePlan(plan: ChildExpensePlan): ChildExpensePlan {
  return {
    ...plan,
    lifeEvents: plan.lifeEvents.map((event) => ({
      ...event
    }))
  }
}

function getPlan(plans: Map<number, ChildExpensePlan>, personId: number) {
  return clonePlan(plans.get(personId) ?? createDefaultPlan())
}

export const useChildStore = create<ChildStore>()(
  persist(
    (set) => ({
      plans: new Map(),

      updatePlan: (personId, value) => {
        set((state) => {
          const currentPlan = getPlan(state.plans, personId)
          const nextPlans = new Map(state.plans)

          nextPlans.set(personId, {
            ...currentPlan,
            ...value
          })

          return {
            plans: nextPlans
          }
        })
      },

      updateLifeEvent: (personId, eventId, value) => {
        set((state) => {
          const currentPlan = getPlan(state.plans, personId)
          const nextPlans = new Map(state.plans)

          nextPlans.set(personId, {
            ...currentPlan,
            lifeEvents: currentPlan.lifeEvents.map((event) =>
              event.id === eventId ? { ...event, ...value } : event
            )
          })

          return {
            plans: nextPlans
          }
        })
      },

      addLifeEvent: (personId) => {
        set((state) => {
          const currentPlan = getPlan(state.plans, personId)
          const nextPlans = new Map(state.plans)

          nextPlans.set(personId, {
            ...currentPlan,
            lifeEvents: [
              ...currentPlan.lifeEvents,
              {
                id: currentPlan.nextLifeEventId,
                title: '',
                age: null,
                amount: null
              }
            ],
            nextLifeEventId: currentPlan.nextLifeEventId + 1
          })

          return {
            plans: nextPlans
          }
        })
      },

      deleteLifeEvent: (personId, eventId) => {
        set((state) => {
          const currentPlan = getPlan(state.plans, personId)
          const nextPlans = new Map(state.plans)

          nextPlans.set(personId, {
            ...currentPlan,
            lifeEvents: currentPlan.lifeEvents.filter((event) => event.id !== eventId)
          })

          return {
            plans: nextPlans
          }
        })
      }
    }),
    {
      name: 'child-storage',
      partialize: (state) => ({
        plans: Array.from(state.plans.entries())
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        state.plans = new Map(state.plans)
      }
    }
  )
)
