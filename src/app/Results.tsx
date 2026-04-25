import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { BarChart } from '@mui/x-charts/BarChart'
import { LineChart } from '@mui/x-charts/LineChart'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Navi from '@/components/common/Navi'
import { useHomeStore, type HomePlan, type OwnLoan, type RepaymentType } from '@/store/useHomeStore'
import { useFamilyStore, type Person } from '@/store/useFamilyStore'
import { useChildStore, type ChildExpensePlan } from '@/store/useChildStore'
import { useCarStore, type CarPlan } from '@/store/useCarStore'
import { useLivingStore, type LivingPlan } from '@/store/useLivingStore'
import { useIncomeStore, type MemberIncome, type Assets } from '@/store/useIncomeStore'
import { useOtherStore, type OtherExpense } from '@/store/useOtherStore'
import { useRetirementStore, type RetirementPlan } from '@/store/useRetirementStore'
import React from 'react'

type SimulationChartDatum = {
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
}

const COLORS = {
  rentalBase: '#3a86ff',
  rentalRenewal: '#fb5607',
  ownSingle: '#2a9d8f',
  ownMain: '#e63636ff',
  ownPartner: '#ffcb49ff',
  homeMaintenance: '#af61f4ff',
  childExpense: '#51e7e7ff',
  carExpense: '#f174d8ff',
  livingExpense: '#38b000',
  otherExpense: '#3a3a39ff',
  income: '#38b000',
  balance: '#2179bcff'
}

const CURRENT_YEAR = new Date().getFullYear()

/**
 * 子どもの教育費を年度ごとに計算する
 */
const calculateChildExpenseForYear = (child: Person, plan: ChildExpensePlan, year: number): number => {
  if (child.age === null) return 0
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
const calculateCarExpenseForYear = (car: CarPlan, year: number): number => {
  if (car.purchaseYear === null) return 0
  const elapsedYears = year - car.purchaseYear
  if (elapsedYears < 0) return 0

  let totalMan = 0

  // 購入年に頭金を計上
  if (elapsedYears === 0) {
    totalMan += car.downPayment ?? 0
  }

  // 維持費（税金、保険など）
  totalMan += (car.taxYearlyAmount ?? 0) + (car.maintenanceYearlyAmount ?? 0)

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
const calculateMemberSalaryForYear = (person: Person, incomeData: MemberIncome, year: number): number => {
  if (person.age === null) return 0
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
const calculateMemberRetirementAllowanceForYear = (person: Person, incomeData: MemberIncome, year: number): number => {
  if (person.age === null) return 0
  const birthYear = CURRENT_YEAR - person.age
  const ageInYear = year - birthYear
  if (incomeData.occupation === 'employee' && ageInYear === (incomeData.retirementAge ?? 60)) {
    return incomeData.retirementAllowance ?? 0
  }
  return 0
}

const formatCurrency = (amount: number) => amount.toLocaleString()
const formatMan = (amount: number) => (amount / 10_000).toLocaleString(undefined, { maximumFractionDigits: 1 })

const isRenewalYear = (year: number, fromYear: number, frequency: number | null) =>
  !!frequency && frequency > 0 && year !== fromYear && (year - fromYear + 1) % frequency === 0

const calculateMonthlyPayment = (amount: number, monthlyRate: number, totalMonths: number) => {
  if (monthlyRate === 0) return amount / totalMonths
  const ratePower = (1 + monthlyRate) ** totalMonths
  return (amount * monthlyRate * ratePower) / (ratePower - 1)
}

const calculateOwnLoanYearlyCost = (loan: OwnLoan, elapsedYears: number, repaymentType: RepaymentType) => {
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
 * シミュレーションの期間を取得
 */
const getSimulationRange = (homePlans: HomePlan[], people: Map<number, Person>) => {
  const years = homePlans.flatMap((p) => [p.fromYear, p.toYear]).filter((y): y is number => y !== null)
  const myself = Array.from(people.values()).find((p) => p.relationship === 'myself')
  const endYear = myself && myself.age !== null ? CURRENT_YEAR + (90 - myself.age) : CURRENT_YEAR + 50
  return { startYear: Math.min(CURRENT_YEAR, ...years), endYear }
}

/**
 * シミュレーションデータを構築
 */
const buildSimulationData = (
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
      total: 0
    }

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
      if (expense.startYear === null || year < expense.startYear || expense.amount === null) return
      const elapsed = year - expense.startYear
      const isOccurring = expense.frequency && expense.frequency > 0 ? elapsed % expense.frequency === 0 : elapsed === 0
      if (isOccurring) {
        datum.otherExpense += expense.amount * 10_000
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
    let yearlyIncome = (incomeData.passiveIncome ?? 0) * 12 * 10_000
    if (myself) {
      yearlyIncome += calculateMemberSalaryForYear(myself, incomeData.main, year) * 10_000
      yearlyIncome += calculateMemberRetirementAllowanceForYear(myself, incomeData.main, year) * 10_000
      const myAge = year - (CURRENT_YEAR - myself.age!)
      if (myAge >= retirementPlan.selfPensionStartAge) {
        yearlyIncome += retirementPlan.selfPensionMonthly * 12 * 10_000
      }
    }
    if (spouse) {
      yearlyIncome += calculateMemberSalaryForYear(spouse, incomeData.partner, year) * 10_000
      yearlyIncome += calculateMemberRetirementAllowanceForYear(spouse, incomeData.partner, year) * 10_000
      const spouseAge = year - (CURRENT_YEAR - spouse.age!)
      if (spouseAge >= retirementPlan.spousePensionStartAge) {
        yearlyIncome += retirementPlan.spousePensionMonthly * 12 * 10_000
      }
    }
    datum.income = yearlyIncome

    currentBalance += (datum.income - datum.total) / 10_000
    datum.balance = currentBalance
    return datum
  })
}

export default function Results() {
  const { plans: homePlans } = useHomeStore()
  const { people } = useFamilyStore()
  const { plans: childPlans } = useChildStore()
  const { cars: carPlans } = useCarStore()
  const { plan: livingPlan } = useLivingStore()
  const { expenses: otherExpenses } = useOtherStore()
  const { main, partner, assets, passiveIncome } = useIncomeStore()
  const retirementData = useRetirementStore()

  const [tabValue, setTabValue] = React.useState(0)
  const dataset = React.useMemo(
    () =>
      buildSimulationData(
        homePlans,
        people,
        childPlans,
        carPlans,
        livingPlan,
        otherExpenses,
        {
          main,
          partner,
          assets,
          passiveIncome
        },
        retirementData
      ),
    [
      homePlans,
      people,
      childPlans,
      carPlans,
      livingPlan,
      otherExpenses,
      main,
      partner,
      assets,
      passiveIncome,
      retirementData
    ]
  )

  const finalBalance = dataset[dataset.length - 1]?.balance ?? 0
  const peakExpense = Math.max(...dataset.map((d) => d.total))
  const peakYear = dataset.find((d) => d.total === peakExpense)?.year

  // グラフの幅をデータ数（年度数）に応じて計算
  const chartWidth = Math.max(800, dataset.length * 40)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Navi />
      <Box sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, md: 4 } }}>
        <Typography variant="h4" sx={{ marginBottom: '8px', fontWeight: 'bold' }}>
          シミュレーション結果
        </Typography>
        <Typography color="text.secondary" sx={{ marginBottom: 4 }}>
          将来の家計収支と資産残高の推移を確認しましょう。
        </Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ marginBottom: 4 }}>
          <Card sx={{ flex: 1, bgcolor: finalBalance >= 0 ? 'primary.light' : 'error.light', color: 'white' }}>
            <CardContent>
              <Typography variant="overline">90歳時点の資産残高</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(Math.floor(finalBalance))} 万円
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="overline">最大支出（年額）</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatMan(peakExpense)} 万円
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {peakYear}年ごろ
              </Typography>
            </CardContent>
          </Card>
        </Stack>

        <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
              <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="scrollable" scrollButtons="auto">
                <Tab label="資産残高推移" />
                <Tab label="収支比較" />
                <Tab label="支出の内訳" />
              </Tabs>
            </Box>

            <Box sx={{ p: 3 }}>
              {dataset.length === 0 ? (
                <Typography color="text.secondary">データを入力するとシミュレーション結果が表示されます。</Typography>
              ) : (
                <>
                  {tabValue === 0 && (
                    <>
                      <Box sx={{ width: '100%', overflowX: 'auto' }}>
                        <Box sx={{ minWidth: Math.max(800, dataset.length * 10) }}>
                          <LineChart
                            dataset={dataset}
                            height={550}
                            margin={{ top: 40, right: 20, bottom: 100, left: 100 }}
                            xAxis={[
                              {
                                dataKey: 'year',
                                valueFormatter: (v: number) => `${v}年`
                              }
                            ]}
                            yAxis={[
                              { label: '資産残高 (万円)', valueFormatter: (v: number) => `${v.toLocaleString()}万` }
                            ]}
                            series={[
                              {
                                dataKey: 'balance',
                                label: '資産残高',
                                color: COLORS.balance,
                                showMark: false,
                                area: true
                              }
                            ]}
                            slotProps={{
                              legend: {
                                direction: 'horizontal',
                                position: { vertical: 'top', horizontal: 'center' }
                              }
                            }}
                          />
                        </Box>
                      </Box>

                      <Box sx={{ mt: 5 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                          資産残高 詳細 (単位: 万円)
                        </Typography>
                        <Box sx={{ overflowX: 'auto', display: 'flex', gap: 3, pb: 2 }}>
                          {Array.from({ length: Math.ceil(dataset.length / 10) }).map((_, i) => {
                            const chunk = dataset.slice(i * 10, i * 10 + 10)
                            return (
                              <TableContainer
                                key={i}
                                component={Paper}
                                variant="outlined"
                                sx={{ minWidth: 180, maxWidth: 220, borderRadius: 2 }}
                              >
                                <Table size="small">
                                  <TableHead>
                                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                                      <TableCell sx={{ fontWeight: 'bold' }}>年</TableCell>
                                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                        残高
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {chunk.map((d) => (
                                      <TableRow key={d.year} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                                          {d.year}年
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'medium' }}>
                                          {Math.floor(d.balance).toLocaleString()}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            )
                          })}
                        </Box>
                      </Box>
                    </>
                  )}
                  {tabValue === 1 && (
                    <Box sx={{ width: '100%', overflowX: 'auto' }}>
                      <Box sx={{ minWidth: chartWidth }}>
                        <BarChart
                          dataset={dataset}
                          height={550}
                          margin={{ top: 40, right: 20, bottom: 100, left: 100 }}
                          xAxis={[
                            {
                              dataKey: 'year',
                              scaleType: 'band',
                              valueFormatter: (v: number) => `${v}年`
                            }
                          ]}
                          yAxis={[{ label: '収支 (万円)', valueFormatter: (v: number) => `${v.toLocaleString()}万` }]}
                          series={[
                            { dataKey: 'income', label: '収入', color: COLORS.income },
                            { dataKey: 'total', label: '支出', color: COLORS.rentalRenewal }
                          ]}
                          slotProps={{
                            legend: {
                              direction: 'horizontal',
                              position: { vertical: 'top', horizontal: 'center' }
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                  {tabValue === 2 && (
                    <Box sx={{ width: '100%', overflowX: 'auto' }}>
                      <Box sx={{ minWidth: chartWidth }}>
                        <BarChart
                          dataset={dataset}
                          height={550}
                          margin={{ top: 40, right: 20, bottom: 100, left: 100 }}
                          xAxis={[
                            {
                              dataKey: 'year',
                              scaleType: 'band',
                              valueFormatter: (v: number) => `${v}年`
                            }
                          ]}
                          yAxis={[{ label: '支出 (万円)', valueFormatter: (v: number) => `${v.toLocaleString()}万` }]}
                          series={[
                            { dataKey: 'rentalBase', label: '家賃', stack: 'a', color: COLORS.rentalBase },
                            { dataKey: 'rentalRenewal', label: '更新料', stack: 'a', color: COLORS.rentalRenewal },
                            { dataKey: 'ownSingle', label: '住宅ローン', stack: 'a', color: COLORS.ownSingle },
                            { dataKey: 'ownMain', label: 'ペアローン(主)', stack: 'a', color: COLORS.ownMain },
                            { dataKey: 'ownPartner', label: 'ペアローン(副)', stack: 'a', color: COLORS.ownPartner },
                            { dataKey: 'homeMaintenance', label: '維持費', stack: 'a', color: COLORS.homeMaintenance },
                            { dataKey: 'childExpense', label: '子教育費', stack: 'a', color: COLORS.childExpense },
                            { dataKey: 'carExpense', label: '車両費', stack: 'a', color: COLORS.carExpense },
                            { dataKey: 'livingExpense', label: '生活費', stack: 'a', color: COLORS.livingExpense },
                            { dataKey: 'otherExpense', label: 'その他', stack: 'a', color: COLORS.otherExpense }
                          ]}
                          slotProps={{
                            legend: {
                              direction: 'horizontal',
                              position: { vertical: 'top', horizontal: 'center' }
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
