import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { BarChart } from '@mui/x-charts/BarChart'
import Navi from '@/components/common/Navi'
import { useHomeStore, type HomePlan, type OwnLoan, type RepaymentType } from '@/store/useHomeStore'
import { useFamilyStore, type Person } from '@/store/useFamilyStore'
import { useChildStore, type ChildExpensePlan } from '@/store/useChildStore'

type SimulationChartDatum = {
  year: number
  rentalBase: number
  rentalRenewal: number
  ownSingle: number
  ownMain: number
  ownPartner: number
  childExpense: number
  total: number
}

const COLORS = {
  rentalBase: '#7c8cff',
  rentalRenewal: '#ff9f6e',
  ownSingle: '#3bb273',
  ownMain: '#2d7ff9',
  ownPartner: '#8e63ff',
  childExpense: '#f94144'
}

const CURRENT_YEAR = new Date().getFullYear()

function calculateChildExpenseForYear(child: Person, plan: ChildExpensePlan, year: number): number {
  if (child.age === null) return 0

  const birthYear = CURRENT_YEAR - child.age
  const ageInYear = year - birthYear

  let totalMan = 0

  plan.lifeEvents.forEach((event) => {
    if (event.age === ageInYear) {
      totalMan += event.amount ?? 0
    }
  })

  if (ageInYear >= 0 && ageInYear <= 5) {
    if (plan.earlyEducationType === 'nursery' && ageInYear >= (plan.earlyEducationStartAge ?? 0)) {
      if (ageInYear <= 2) {
        totalMan += plan.nurseryTuitionAmountUnder3 ?? 0
      } else {
        totalMan += plan.nurseryTuitionAmountOver3 ?? 0
      }
      totalMan += plan.earlyEducationLessonsAmount ?? 0
    } else if (
      plan.earlyEducationType === 'kindergarten' &&
      ageInYear >= (plan.earlyEducationStartAge ?? 3)
    ) {
      totalMan += plan.earlyEducationTuitionAmount ?? 0
      totalMan += plan.earlyEducationLessonsAmount ?? 0
    }
  } else if (ageInYear >= 6 && ageInYear <= 11) {
    totalMan += plan.elementaryTuitionAmount ?? 0
    totalMan += plan.elementaryLessonsAmount ?? 0
  } else if (ageInYear >= 12 && ageInYear <= 14) {
    totalMan += plan.juniorHighTuitionAmount ?? 0
    totalMan += plan.juniorHighLessonsAmount ?? 0
  } else if (ageInYear >= 15 && ageInYear <= 17) {
    totalMan += plan.highSchoolTuitionAmount ?? 0
    totalMan += plan.highSchoolLessonsAmount ?? 0
  } else if (ageInYear >= 18) {
    if (plan.higherEducationType !== 'none') {
      const duration = plan.higherEducationDuration ?? 0
      if (duration > 0 && ageInYear < 18 + duration) {
        totalMan += plan.higherEducationTuitionAmount ?? 0
        totalMan += plan.higherEducationLessonsAmount ?? 0
      }
    }
  }

  return totalMan * 10_000
}

function formatCurrency(amount: number) {
  return amount.toLocaleString()
}

function formatMan(amount: number) {
  return (amount / 10_000).toLocaleString(undefined, {
    maximumFractionDigits: 1
  })
}

function isRenewalYear(year: number, fromYear: number, renewalFrequency: number | null) {
  if (!renewalFrequency || renewalFrequency <= 0) {
    return false
  }

  // 2年契約なら2年目、4年目...の年に更新料を載せる。
  return year !== fromYear && (year - fromYear + 1) % renewalFrequency === 0
}

function calculateMonthlyPayment(amount: number, monthlyRate: number, totalMonths: number) {
  if (monthlyRate === 0) {
    return amount / totalMonths
  }

  const ratePower = (1 + monthlyRate) ** totalMonths
  return (amount * monthlyRate * ratePower) / (ratePower - 1)
}

function calculateOwnLoanYearlyCost(
  loan: OwnLoan,
  elapsedYears: number,
  repaymentType: RepaymentType
) {
  const amount = loan.amount ?? 0
  const interestRate = loan.interestRate ?? 0
  const period = loan.period ?? 0

  if (amount <= 0 || period <= 0 || elapsedYears < 0 || elapsedYears >= period) {
    return 0
  }

  const monthlyRate = interestRate / 100 / 12
  const totalMonths = period * 12
  const elapsedMonths = elapsedYears * 12

  if (repaymentType === 'equal-principal-interest') {
    // 元利均等返済は毎月返済額を固定して、その年の12か月分を年額にする。
    return calculateMonthlyPayment(amount, monthlyRate, totalMonths) * 12
  }

  if (repaymentType === 'equal-principal') {
    // 元金均等返済は毎月の元金を固定し、残債に応じて利息が減っていく。
    const monthlyPrincipal = amount / totalMonths
    let yearlyTotal = 0

    for (let month = 0; month < 12; month += 1) {
      const paidMonths = elapsedMonths + month

      if (paidMonths >= totalMonths) {
        break
      }

      const remainingPrincipal = amount - monthlyPrincipal * paidMonths
      const monthlyInterest = remainingPrincipal * monthlyRate
      yearlyTotal += monthlyPrincipal + monthlyInterest
    }

    return yearlyTotal
  }

  return 0
}

function buildSimulationChartData(
  homePlans: HomePlan[],
  people: Map<number, Person>,
  childPlans: Map<number, ChildExpensePlan>
) {
  const homeYears = homePlans
    .flatMap((plan) => [plan.fromYear, plan.toYear])
    .filter((year): year is number => year !== null)

  const childYears: number[] = []

  people.forEach((person, id) => {
    if (person.relationship === 'child' && person.age !== null) {
      const plan = childPlans.get(id)
      if (!plan) return

      const birthYear = CURRENT_YEAR - person.age

      let maxAge = plan.higherEducationType !== 'none'
        ? 18 + Math.max(0, plan.higherEducationDuration ?? 0) - 1
        : 17

      plan.lifeEvents.forEach((e) => {
        if (e.age !== null && e.age > maxAge) {
          maxAge = e.age
        }
      })

      const startAgesArray = plan.lifeEvents.map((e) => e.age ?? 0)
      if (plan.earlyEducationStartAge !== null) {
        startAgesArray.push(plan.earlyEducationStartAge)
      } else {
        startAgesArray.push(0)
      }
      
      const startAge = Math.min(...startAgesArray, 0)

      childYears.push(birthYear + startAge)
      childYears.push(birthYear + maxAge)
    }
  })

  const allYears = [...homeYears, ...childYears]

  if (allYears.length === 0) {
    return []
  }

  const startYear = Math.min(CURRENT_YEAR, ...allYears)
  const endYear = Math.max(CURRENT_YEAR, ...allYears)

  return Array.from({ length: endYear - startYear + 1 }, (_, offset) => {
    const year = startYear + offset

    const datum: SimulationChartDatum = {
      year,
      rentalBase: 0,
      rentalRenewal: 0,
      ownSingle: 0,
      ownMain: 0,
      ownPartner: 0,
      childExpense: 0,
      total: 0
    }

    homePlans.forEach((plan) => {
      if (plan.fromYear === null || plan.toYear === null) {
        return
      }

      if (year < plan.fromYear || year > plan.toYear) {
        return
      }

      if (plan.type === 'rental') {
        const monthlyFee = plan.rental.fee ?? 0
        const renewalFee = plan.rental.renewalFee ?? 0

        datum.rentalBase += monthlyFee * 12

        if (isRenewalYear(year, plan.fromYear, plan.rental.renewalFrequency)) {
          datum.rentalRenewal += renewalFee
        }

        return
      }

      const elapsedYears = year - plan.fromYear

      if (plan.own.loanMode === 'pair') {
        datum.ownMain += calculateOwnLoanYearlyCost(
          plan.own.loans[0],
          elapsedYears,
          plan.own.loans[0]?.repaymentType ?? ''
        )
        datum.ownPartner += calculateOwnLoanYearlyCost(
          plan.own.loans[1],
          elapsedYears,
          plan.own.loans[1]?.repaymentType ?? ''
        )
        return
      }

      datum.ownSingle += calculateOwnLoanYearlyCost(
        plan.own.loans[0],
        elapsedYears,
        plan.own.loans[0]?.repaymentType ?? ''
      )
    })

    people.forEach((person, id) => {
      if (person.relationship === 'child') {
        const plan = childPlans.get(id)
        if (plan) {
          datum.childExpense += calculateChildExpenseForYear(person, plan, year)
        }
      }
    })

    datum.total =
      datum.rentalBase +
      datum.rentalRenewal +
      datum.ownSingle +
      datum.ownMain +
      datum.ownPartner +
      datum.childExpense

    return datum
  })
}

export default function Results() {
  const { plans: homePlans } = useHomeStore()
  const { people } = useFamilyStore()
  const { plans: childPlans } = useChildStore()

  const dataset = buildSimulationChartData(homePlans, people, childPlans)

  return (
    <Box sx={{ width: '100%', display: 'flex' }}>
      <Navi />
      <Box
        sx={{
          width: '100%',
          padding: '40px 20px',
          margin: '0 auto'
        }}
      >
        <Typography variant="h4" sx={{ marginBottom: '8px' }}>
          結果
        </Typography>
        <Typography color="text.secondary" sx={{ marginBottom: 3 }}>
          入力されたデータから、シミュレーション結果（年ごとの支出）を MUI Charts で表示しています。
        </Typography>

        <Card>
          <CardContent>
            {dataset.length === 0 ? (
              <Typography color="text.secondary">
                家族や住宅費等のデータを追加すると、年ごとの支出グラフが表示されます。
              </Typography>
            ) : (
              <Stack spacing={3}>
                <BarChart
                  dataset={dataset}
                  height={420}
                  margin={{ top: 24, right: 24, bottom: 48, left: 72 }}
                  xAxis={[
                    {
                      dataKey: 'year',
                      scaleType: 'band',
                      label: '年'
                    }
                  ]}
                  yAxis={[
                    {
                      label: '万',
                      valueFormatter: (value: number) => `${formatMan(value)}万`
                    }
                  ]}
                  series={[
                    {
                      dataKey: 'rentalBase',
                      label: '賃貸: 家賃',
                      stack: 'housing',
                      color: COLORS.rentalBase,
                      valueFormatter: (value) => `${formatCurrency(value ?? 0)}円`
                    },
                    {
                      dataKey: 'rentalRenewal',
                      label: '賃貸: 更新料',
                      stack: 'housing',
                      color: COLORS.rentalRenewal,
                      valueFormatter: (value) => `${formatCurrency(value ?? 0)}円`
                    },
                    {
                      dataKey: 'ownSingle',
                      label: '単身ローン',
                      stack: 'housing',
                      color: COLORS.ownSingle,
                      valueFormatter: (value) => `${formatCurrency(value ?? 0)}円`
                    },
                    {
                      dataKey: 'ownMain',
                      label: 'ペアローン: 主債務者',
                      stack: 'housing',
                      color: COLORS.ownMain,
                      valueFormatter: (value) => `${formatCurrency(value ?? 0)}円`
                    },
                    {
                      dataKey: 'ownPartner',
                      label: 'ペアローン: 配偶者',
                      stack: 'housing',
                      color: COLORS.ownPartner,
                      valueFormatter: (value) => `${formatCurrency(value ?? 0)}円`
                    },
                    {
                      dataKey: 'childExpense',
                      label: '子供費用',
                      stack: 'housing',
                      color: COLORS.childExpense,
                      valueFormatter: (value) => `${formatCurrency(value ?? 0)}円`
                    }
                  ]}
                  grid={{ horizontal: true }}
                  borderRadius={6}
                  slotProps={{
                    legend: {
                      direction: 'horizontal',
                      position: { vertical: 'top', horizontal: 'center' }
                    }
                  }}
                  sx={{
                    '& .MuiChartsAxis-label': {
                      fontSize: 12
                    }
                  }}
                />

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {dataset.map((item) => (
                    <Typography key={item.year} variant="body2" color="text.secondary">
                      {item.year}: {formatMan(item.total)}万
                    </Typography>
                  ))}
                </Box>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
