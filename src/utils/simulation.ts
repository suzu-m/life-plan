import { type HomePlan, type OwnLoan, type RepaymentType } from '@/store/useHomeStore'
import { type Person } from '@/store/useFamilyStore'
import { type ChildExpensePlan } from '@/store/useChildStore'
import { type CarPlan } from '@/store/useCarStore'
import { type LivingPlan } from '@/store/useLivingStore'
import { type MemberIncome, type Assets } from '@/store/useIncomeStore'
import { type OtherExpense } from '@/store/useOtherStore'
import { type RetirementPlan } from '@/store/useRetirementStore'

export type SimulationChartDatum = {
  year: number
  rentalBase: number
  rentalRenewal: number
  ownSingle: number
  ownMain: number
  ownPartner: number
  homeMaintenance: number
  childExpense: number
  carExpense: number
  livingExpense: number
  otherExpense: number
  income: number
  balance: number
  total: number
  memberAges: { name: string; age: number }[]
}

const CURRENT_YEAR = new Date().getFullYear()

/**
 * 更新月かどうかを判定する
 */
export const isRenewalYear = (year: number, fromYear: number, frequency: number | null): boolean =>
  !!frequency && frequency > 0 && year !== fromYear && (year - fromYear + 1) % frequency === 0

/**
 * 月額返済額を計算する（元利均等）
 */
const calculateMonthlyPayment = (amount: number, monthlyRate: number, totalMonths: number): number => {
  if (monthlyRate === 0) return amount / totalMonths
  const ratePower = Math.pow(1 + monthlyRate, totalMonths)
  return (amount * monthlyRate * ratePower) / (ratePower - 1)
}

/**
 * 住宅ローンの年間コストを計算する
 */
export const calculateOwnLoanYearlyCost = (loan: OwnLoan, elapsedYears: number, repaymentType: RepaymentType): number => {
  const amount = loan.amount ?? 0
  const period = loan.period ?? 0
  if (amount <= 0 || period <= 0 || elapsedYears < 0 || elapsedYears >= period) return 0
  const monthlyRate = (loan.interestRate ?? 0) / 100 / 12
  const totalMonths = period * 12
  if (repaymentType === 'equal-principal-interest')
    return calculateMonthlyPayment(amount, monthlyRate, totalMonths) * 12
  const monthlyPrincipal = amount / totalMonths
  let yearlyTotal = 0
  for (let month = 0; month < 12; month++) {
    const remainingBalance = amount - monthlyPrincipal * (elapsedYears * 12 + month)
    yearlyTotal += monthlyPrincipal + remainingBalance * monthlyRate
  }
  return yearlyTotal
}

/**
 * 子どもの教育費を年度ごとに計算する
 */
export const calculateChildExpenseForYear = (child: Person, plan: ChildExpensePlan, year: number): number => {
  if (child.age === null || child.age === undefined || isNaN(child.age)) return 0
  const birthYear = CURRENT_YEAR - child.age
  const ageInYear = year - birthYear
  let totalMan = 0
  plan.lifeEvents.forEach((event) => {
    if (event.age === ageInYear) totalMan += event.amount ?? 0
  })
  if (ageInYear >= 0 && ageInYear <= 5) {
    if (plan.earlyEducationType === 'nursery' && ageInYear >= (plan.earlyEducationStartAge ?? 0)) {
      totalMan += ageInYear <= 2 ? (plan.nurseryTuitionAmountUnder3 ?? 0) : (plan.nurseryTuitionAmountOver3 ?? 0)
      totalMan += plan.earlyEducationLessonsAmount ?? 0
    } else if (plan.earlyEducationType === 'kindergarten' && ageInYear >= (plan.earlyEducationStartAge ?? 3)) {
      totalMan += plan.earlyEducationTuitionAmount ?? 0
      totalMan += plan.earlyEducationLessonsAmount ?? 0
    }
  } else if (ageInYear >= 6 && ageInYear <= 11) {
    totalMan +=
      (plan.elementaryTuitionAmount ?? 0) + (plan.elementaryLessonsAmount ?? 0) + (plan.elementaryAllowanceAmount ?? 0)
  } else if (ageInYear >= 12 && ageInYear <= 14) {
    totalMan +=
      (plan.juniorHighTuitionAmount ?? 0) + (plan.juniorHighLessonsAmount ?? 0) + (plan.juniorHighAllowanceAmount ?? 0)
  } else if (ageInYear >= 15 && ageInYear <= 17) {
    totalMan +=
      (plan.highSchoolTuitionAmount ?? 0) + (plan.highSchoolLessonsAmount ?? 0) + (plan.highSchoolAllowanceAmount ?? 0)
  } else if (ageInYear >= 18) {
    if (plan.higherEducationType !== 'none') {
      const duration = plan.higherEducationDuration ?? 0
      if (duration > 0 && ageInYear < 18 + duration) {
        totalMan += (plan.higherEducationTuitionAmount ?? 0) + (plan.higherEducationLessonsAmount ?? 0)
      }
    }
  }
  return totalMan * 10_000
}

/**
 * 車の費用を年度ごとに計算する
 */
export const calculateCarExpenseForYear = (car: CarPlan, year: number): number => {
  if (car.purchaseYear === null || car.purchaseYear === undefined || isNaN(car.purchaseYear)) return 0
  const elapsedYears = year - car.purchaseYear
  if (elapsedYears < 0) return 0

  // 終了年の判定
  // roughToYear (現 toYear) が設定されていればそれを上限とする。
  // 設定がない場合は詳細モードなら無制限、ざっくりモードなら購入年のみとする。
  const endYear = car.toYear ?? (car.inputMode === 'detailed' ? 9999 : car.purchaseYear)
  if (year > endYear) return 0

  let totalMan = 0

  // 1. 購入・ローン関連費用の計算
  if (car.inputMode === 'rough') {
    // ざっくりパターンの場合
    if (elapsedYears === 0) {
      totalMan += car.roughInitialCost ?? 0
    }
    if (year <= endYear) {
      totalMan += (car.roughMonthlyAmount ?? 0) * 12
    }
  } else {
    // 詳細パターンの場合
    if (elapsedYears === 0) {
      totalMan += car.downPayment ?? 0
    }

    // ローン支払い
    if ((car.loanPayments ?? 0) > 0 && (car.loanMonthlyAmount ?? 0) > 0) {
      const remainingPayments = (car.loanPayments ?? 0) - elapsedYears * 12
      if (remainingPayments > 0) totalMan += Math.min(12, remainingPayments) * (car.loanMonthlyAmount ?? 0)
    }

    // 残価精算（ローンの最終回と同じ年に発生すると仮定）
    if ((car.zankureFinalAmount ?? 0) > 0) {
      const finalPaymentYear = car.purchaseYear + Math.floor(((car.loanPayments ?? 0) - 1) / 12)
      if (year === finalPaymentYear) totalMan += car.zankureFinalAmount ?? 0
    }
  }

  // 2. 維持費の計算（これは全モード共通、ただし設定された終了年まで）
  totalMan += (car.taxYearlyAmount ?? 0) + (car.maintenanceYearlyAmount ?? 0)

  // 車検費用
  if (elapsedYears > 0 && (car.shakenAmount ?? 0) > 0) {
    const isShakenYear = car.isNewCar ? elapsedYears >= 3 && (elapsedYears - 3) % 2 === 0 : elapsedYears % 2 === 0
    if (isShakenYear) totalMan += car.shakenAmount ?? 0
  }

  return totalMan * 10_000
}

/**
 * 収入（給与）を年度ごとに計算する
 */
export const calculateMemberSalaryForYear = (person: Person, incomeData: MemberIncome, year: number): number => {
  if (person.age === null || person.age === undefined || isNaN(person.age)) return 0
  const birthYear = CURRENT_YEAR - person.age
  const ageInYear = year - birthYear

  // 退職判定
  const isRetired =
    incomeData.occupation === 'employee'
      ? ageInYear >= (incomeData.retirementAge ?? 60)
      : ageInYear >= (incomeData.retirementAge ?? 70)

  if (isRetired) return 0

  const baseSalary = incomeData.annualSalary ?? 0
  const elapsedYears = year - CURRENT_YEAR

  // 昇給を考慮したフルタイム時の期待年収を算出
  let fullSalary = baseSalary
  if (elapsedYears > 0) {
    const increaseValue = incomeData.salaryIncreaseValue ?? 0
    if (incomeData.salaryIncreaseType === 'amount') {
      fullSalary = baseSalary + elapsedYears * increaseValue
    } else {
      fullSalary = baseSalary * Math.pow(1 + increaseValue / 100, elapsedYears)
    }
  }

  // 産休・育休および時短勤務の考慮
  const leave = incomeData.leavePeriods?.find((p) => p.year === year)
  const shortTime = incomeData.shortTimePeriods?.find((p) => year >= p.startYear && year <= p.endYear)

  const leaveMonths = leave ? Math.min(12, leave.months) : 0
  const workMonths = 12 - leaveMonths

  // 1. 産休・育休期間の収入（給付金等）
  const leaveIncome = (leaveMonths / 12) * fullSalary * ((leave?.rate ?? 0) / 100)

  // 2. 稼働期間の収入（時短勤務を考慮）
  const workRate = shortTime ? shortTime.rate / 100 : 1
  const workIncome = (workMonths / 12) * fullSalary * workRate

  return leaveIncome + workIncome
}

/**
 * 退職金を年度ごとに計算する
 */
export const calculateMemberRetirementAllowanceForYear = (person: Person, incomeData: MemberIncome, year: number): number => {
  if (person.age === null || person.age === undefined || isNaN(person.age)) return 0
  const birthYear = CURRENT_YEAR - person.age
  const ageInYear = year - birthYear
  if (incomeData.occupation === 'employee' && ageInYear === (incomeData.retirementAge ?? 60)) {
    return incomeData.retirementAllowance ?? 0
  }
  return 0
}

/**
 * シミュレーションの期間を取得
 */
export const getSimulationRange = (homePlans: HomePlan[], people: Map<number, Person>): { startYear: number; endYear: number } => {
  const years = homePlans
    .flatMap((p) => [p.fromYear, p.toYear])
    .filter((y): y is number => typeof y === 'number' && !isNaN(y))
    
  const myself = Array.from(people.values()).find((p) => p.relationship === 'myself')
  const myselfAge = myself?.age
  const validAge = typeof myselfAge === 'number' && !isNaN(myselfAge) ? myselfAge : null
  
  const endYear = validAge !== null ? CURRENT_YEAR + (90 - validAge) : CURRENT_YEAR + 50
  return { startYear: Math.min(CURRENT_YEAR, ...years), endYear }
}

/**
 * シミュレーションデータを構築
 */
export const buildSimulationData = (
  homePlans: HomePlan[],
  people: Map<number, Person>,
  childPlans: Map<number, ChildExpensePlan>,
  carPlans: Map<number, CarPlan>,
  livingPlan: LivingPlan,
  otherExpenses: Map<number, OtherExpense>,
  incomeData: { main: MemberIncome; partner: MemberIncome; assets: Assets; passiveIncome: number | null },
  retirementPlan: RetirementPlan
): SimulationChartDatum[] => {
  const { startYear, endYear } = getSimulationRange(homePlans, people)
  let currentBalance =
    (incomeData.assets.bankSavings ?? 0) +
    (incomeData.assets.nisa ?? 0) +
    (incomeData.assets.ideco ?? 0) +
    (incomeData.assets.otherInvestments ?? 0)
  const myself = Array.from(people.values()).find((p) => p.relationship === 'myself')
  const spouse = Array.from(people.values()).find((p) => p.relationship === 'spouse')

  return Array.from({ length: endYear - startYear + 1 }, (_, offset) => {
    const year = startYear + offset
    const datum: SimulationChartDatum = {
      year,
      rentalBase: 0,
      rentalRenewal: 0,
      ownSingle: 0,
      ownMain: 0,
      ownPartner: 0,
      homeMaintenance: 0,
      childExpense: 0,
      carExpense: 0,
      livingExpense: 0,
      otherExpense: 0,
      income: 0,
      balance: 0,
      total: 0,
      memberAges: []
    }

    people.forEach((p) => {
      if (p.age !== null) {
        const ageInYear = year - (CURRENT_YEAR - p.age)
        datum.memberAges.push({
          name: p.name || (p.relationship === 'myself' ? '本人' : p.relationship === 'spouse' ? '配偶者' : '子'),
          age: ageInYear
        })
      }
    })

    homePlans.forEach((plan) => {
      if (!plan.fromYear || !plan.toYear || year < plan.fromYear || year > plan.toYear) return
      if (plan.type === 'rental') {
        datum.rentalBase += (plan.rental.fee ?? 0) * 12
        if (isRenewalYear(year, plan.fromYear, plan.rental.renewalFrequency))
          datum.rentalRenewal += plan.rental.renewalFee ?? 0
      } else {
        const elapsed = year - plan.fromYear
        if (plan.own.loanMode === 'single')
          datum.ownSingle += calculateOwnLoanYearlyCost(
            plan.own.loans[0],
            elapsed,
            plan.own.loans[0]?.repaymentType ?? 'equal-principal-interest'
          )
        else {
          datum.ownMain += calculateOwnLoanYearlyCost(
            plan.own.loans[0],
            elapsed,
            plan.own.loans[0]?.repaymentType ?? 'equal-principal-interest'
          )
          datum.ownPartner += calculateOwnLoanYearlyCost(
            plan.own.loans[1],
            elapsed,
            plan.own.loans[1]?.repaymentType ?? 'equal-principal-interest'
          )
        }
        datum.homeMaintenance +=
          ((plan.own.managementFee ?? 0) +
            (plan.own.repairReserveFee ?? 0) +
            (plan.own.houseRepairReserveFee ?? 0)) *
          12 *
          10_000
        datum.homeMaintenance += (plan.own.propertyTaxYearly ?? 0) * 10_000
      }
    })

    people.forEach((p, id) => {
      if (p.relationship === 'child') {
        const plan = childPlans.get(id)
        if (plan) datum.childExpense += calculateChildExpenseForYear(p, plan, year)
      }
    })

    carPlans.forEach((car) => {
      datum.carExpense += calculateCarExpenseForYear(car, year)
    })

    // 生活費計算
    const myAge = myself && myself.age !== null ? year - (CURRENT_YEAR - myself.age) : 0
    const isRetired = myAge > (incomeData.main.retirementAge ?? 60)
    datum.livingExpense = isRetired
      ? retirementPlan.retirementLivingExpenseMonthly * 12 * 10_000
      : ((livingPlan.foodMonthlyAmount ?? 0) +
          (livingPlan.utilitiesMonthlyAmount ?? 0) +
          (livingPlan.telecomMonthlyAmount ?? 0) +
          (livingPlan.insuranceMonthlyAmount ?? 0) +
          (livingPlan.hobbiesMonthlyAmount ?? 0) +
          (livingPlan.otherMonthlyAmount ?? 0) +
          (livingPlan.allowanceMainMonthlyAmount ?? 0) +
          (livingPlan.allowancePartnerMonthlyAmount ?? 0)) *
        12 *
        10_000

    otherExpenses.forEach((expense) => {
      const start = expense.startYear
      const end = expense.endYear
      const amount = expense.amount
      if (start === null || amount === null) return

      // 開始年より前、または終了年（設定されている場合）より後は除外
      if (year < start || (end !== null && year > end)) return

      const elapsed = year - start
      const freq = expense.frequency ?? 1

      const isOccurring = freq > 0 ? elapsed % freq === 0 : elapsed === 0
      if (isOccurring) {
        datum.otherExpense += amount * 10_000
      }
    })

    datum.total =
      datum.rentalBase +
      datum.rentalRenewal +
      datum.ownSingle +
      datum.ownMain +
      datum.ownPartner +
      datum.homeMaintenance +
      datum.childExpense +
      datum.carExpense +
      datum.livingExpense +
      datum.otherExpense

    // 収入計算
    let yearlyNetIncome = (incomeData.passiveIncome ?? 0) * 10_000
    
    if (myself) {
      // 給与収入（手取り換算 0.75）
      const salary = calculateMemberSalaryForYear(myself, incomeData.main, year) * 10_000
      yearlyNetIncome += Math.floor(salary * 0.75)
      
      // 退職金（100%）
      yearlyNetIncome += calculateMemberRetirementAllowanceForYear(myself, incomeData.main, year) * 10_000
      
      // 年金（100%）
      const myAge = year - (CURRENT_YEAR - myself.age!)
      if (myAge >= retirementPlan.selfPensionStartAge) {
        yearlyNetIncome += retirementPlan.selfPensionMonthly * 12 * 10_000
      }
    }
    
    if (spouse) {
      // 給与収入（手取り換算 0.75）
      const salary = calculateMemberSalaryForYear(spouse, incomeData.partner, year) * 10_000
      yearlyNetIncome += Math.floor(salary * 0.75)
      
      // 退職金（100%）
      yearlyNetIncome += calculateMemberRetirementAllowanceForYear(spouse, incomeData.partner, year) * 10_000
      
      // 年金（100%）
      const spouseAge = year - (CURRENT_YEAR - spouse.age!)
      if (spouseAge >= retirementPlan.spousePensionStartAge) {
        yearlyNetIncome += retirementPlan.spousePensionMonthly * 12 * 10_000
      }
    }
    
    datum.income = yearlyNetIncome

    currentBalance += (datum.income - datum.total) / 10_000
    datum.balance = currentBalance
    return datum
  })
}
