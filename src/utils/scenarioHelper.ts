import { buildSimulationData, type SimulationChartDatum, type FinancialSettings } from './simulation'
import type { Scenario } from '@/store/useScenarioStore'
import type { Person } from '@/store/useFamilyStore'
import type { ChildExpensePlan } from '@/store/useChildStore'
import type { CarPlan } from '@/store/useCarStore'
import type { OtherExpense } from '@/store/useOtherStore'
import type { HomePlan } from '@/store/useHomeStore'
import type { LivingPlan } from '@/store/useLivingStore'
import type { MemberIncome, Assets } from '@/store/useIncomeStore'
import type { RetirementPlan } from '@/store/useRetirementStore'

const parseJSON = <T>(str: string | null, fallback: T): T => {
  if (!str) return fallback
  try {
    return JSON.parse(str) as T
  } catch {
    return fallback
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PersistedState = { state?: Record<string, any> }

export const buildScenarioSimulationData = (scenario: Scenario): SimulationChartDatum[] => {
  const d = scenario.data

  const familyState = parseJSON<PersistedState>(d['family-storage'], {}).state ?? {}
  const incomeState = parseJSON<PersistedState>(d['income-storage'], {}).state ?? {}
  const homeState = parseJSON<PersistedState>(d['home-storage'], {}).state ?? {}
  const childState = parseJSON<PersistedState>(d['child-storage'], {}).state ?? {}
  const carState = parseJSON<PersistedState>(d['car-storage'], {}).state ?? {}
  const livingState = parseJSON<PersistedState>(d['living-storage'], {}).state ?? {}
  const otherState = parseJSON<PersistedState>(d['other-storage'], {}).state ?? {}
  const retirementState = parseJSON<PersistedState>(d['retirement-storage'], {}).state ?? {}
  const financialState = parseJSON<PersistedState>(d['financial-storage'], {}).state ?? {}

  // Restore Maps from Array.from(map.entries()) pattern used by persist partialize
  const people = new Map<number, Person>(familyState.people ?? [])
  const childPlans = new Map<number, ChildExpensePlan>(childState.plans ?? [])
  const carPlans = new Map<number, CarPlan>(
    (carState.cars ?? []).map(([id, car]: [number, CarPlan]) => [
      id,
      {
        ...car,
        inputMode: car.inputMode ?? 'detailed',
        roughMonthlyAmount: car.roughMonthlyAmount ?? null,
        toYear: car.toYear ?? null,
        roughInitialCost: car.roughInitialCost ?? null
      }
    ])
  )
  const otherExpenses = new Map<number, OtherExpense>(otherState.expenses ?? [])

  // Restore Arrays and Objects
  const homePlans: HomePlan[] = homeState.plans ?? []
  const livingPlan: LivingPlan = livingState.plan ?? { overrideBase: null, overridePartner: null }

  const incomeData = {
    main: incomeState.main ?? ({} as MemberIncome),
    partner: incomeState.partner ?? ({} as MemberIncome),
    assets: incomeState.assets ?? ({} as Assets),
    passiveIncome: incomeState.passiveIncome ?? null
  }
  const retirementPlan: RetirementPlan = {
    selfPensionMonthly: retirementState.selfPensionMonthly ?? 15,
    selfPensionStartAge: retirementState.selfPensionStartAge ?? 65,
    spousePensionMonthly: retirementState.spousePensionMonthly ?? 10,
    spousePensionStartAge: retirementState.spousePensionStartAge ?? 65,
    retirementLivingExpenseMonthly: retirementState.retirementLivingExpenseMonthly ?? 30
  }

  const financialSettings: FinancialSettings = {
    investmentYield: financialState.investmentYield ?? 3,
    furusatoNozeiAmount: financialState.furusatoNozeiAmount ?? null,
    mortgageDeductionEnabled: financialState.mortgageDeductionEnabled ?? true,
    otherDeductionsAmount: financialState.otherDeductionsAmount ?? null
  }

  return buildSimulationData(
    homePlans,
    people,
    childPlans,
    carPlans,
    livingPlan,
    otherExpenses,
    incomeData,
    retirementPlan,
    financialSettings
  )
}
