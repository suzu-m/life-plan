import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import HomeIcon from '@mui/icons-material/Home'
import ApartmentIcon from '@mui/icons-material/Apartment'
import Timeline from '@mui/lab/Timeline'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineOppositeContent, { timelineOppositeContentClasses } from '@mui/lab/TimelineOppositeContent'
import Navi from '@/components/common/Navi'
import NumberField from '@/components/common/NumberField'
import RentalCard from '@/components/feature/expense/RentalCard'
import OwnCard from '@/components/feature/expense/OwnCard'
import { useHomeStore, type HomePlan } from '@/store/useHomeStore'
import { useFamilyStore } from '@/store/useFamilyStore'
import { calculateMonthlyPayment } from '@/utils/loan'

/**
 * 通貨形式で金額をフォーマットする
 * @param amount
 * @returns
 */
function formatCurrency(amount: number | null | undefined) {
  if (amount === null || amount === undefined) {
    return '-'
  }

  return amount.toLocaleString()
}

function formatPeriod(plan: HomePlan) {
  if (plan.fromYear && plan.toYear) {
    return `${plan.fromYear}年 - ${plan.toYear}年`
  }

  return '期間未設定'
}

export default function ExpenseHome() {
  const {
    plans,
    draft,
    editingPlanId,
    updateDraft,
    updateDraftType,
    updateDraftRental,
    updateDraftLoanMode,
    updateDraftLoan,
    updateDraftOwnDetails,
    saveDraftPlan,
    editPlan,
    deletePlan,
    resetDraft
  } = useHomeStore()

  const { people } = useFamilyStore()
  const myself = Array.from(people.values()).find((p) => p.relationship === 'myself')
  const spouse = Array.from(people.values()).find((p) => p.relationship === 'spouse')

  const getLoanDisplayName = (name: string) => {
    if (name === '主債務者') {
      return myself?.name ? `主債務者 (${myself.name})` : name
    }
    if (name === '配偶者') {
      return spouse?.name ? `配偶者 (${spouse.name})` : name
    }
    return name
  }

  const currentYear = new Date().getFullYear()
  const isDraftValid = draft.fromYear !== null && draft.toYear !== null && draft.fromYear <= draft.toYear
  // 既存の保存データも含めて、表示時点でも開始年の古い順にそろえる。
  const sortedPlans = [...plans].sort((a, b) => {
    const fromYearA = a.fromYear ?? Number.MAX_SAFE_INTEGER
    const fromYearB = b.fromYear ?? Number.MAX_SAFE_INTEGER

    if (fromYearA !== fromYearB) {
      return fromYearA - fromYearB
    }

    const toYearA = a.toYear ?? Number.MAX_SAFE_INTEGER
    const toYearB = b.toYear ?? Number.MAX_SAFE_INTEGER

    if (toYearA !== toYearB) {
      return toYearA - toYearB
    }

    return a.id - b.id
  })

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
          支出：住宅
        </Typography>
        <Typography color="text.secondary" sx={{ marginBottom: 3 }}>
          期間ごとに賃貸・持ち家を分けて登録できます。
        </Typography>
        {editingPlanId !== null && (
          <Typography color="primary" sx={{ marginBottom: 2 }}>
            編集モードです。内容を変更して「この期間を更新」を押してください。
          </Typography>
        )}

        <Stack spacing={2} sx={{ marginBottom: 4 }}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                {/* 期間と住居タイプを先に決めてから、下の詳細入力を出し分ける。 */}
                <Box>
                  <FormControl>
                    <RadioGroup
                      row
                      value={draft.type}
                      onChange={(e) => updateDraftType(e.target.value as HomePlan['type'])}
                    >
                      <FormControlLabel value="rental" control={<Radio />} label="賃貸" />
                      <FormControlLabel value="own" control={<Radio />} label="持ち家" />
                    </RadioGroup>
                  </FormControl>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <NumberField
                    label="開始年"
                    value={draft.fromYear ?? currentYear}
                    min={currentYear}
                    onValueChange={(value) => {
                      updateDraft({
                        fromYear: value === null ? null : Number(value)
                      })
                    }}
                  />
                  <Typography>~</Typography>
                  <NumberField
                    label="終了年"
                    value={draft.toYear ?? currentYear}
                    min={draft.fromYear ?? currentYear}
                    onValueChange={(value) => {
                      updateDraft({
                        toYear: value === null ? null : Number(value)
                      })
                    }}
                  />
                </Box>

                {draft.type === 'rental' ? (
                  <RentalCard value={draft.rental} onChange={updateDraftRental} />
                ) : (
                  <OwnCard
                    value={draft.own}
                    onLoanModeChange={updateDraftLoanMode}
                    onLoanChange={updateDraftLoan}
                    onOwnDetailsChange={updateDraftOwnDetails}
                  />
                )}

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button variant="text" onClick={resetDraft}>
                    {editingPlanId !== null ? '編集をキャンセル' : '入力をリセット'}
                  </Button>
                  {/* 年の整合性が取れていれば、詳細未入力でも期間プランとして保存できる。 */}
                  <Button variant="contained" onClick={saveDraftPlan} disabled={!isDraftValid}>
                    {editingPlanId !== null ? 'この期間を更新' : 'この期間を追加'}
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {sortedPlans.length > 0 && (
            <Timeline
              sx={{
                p: 0,
                [`& .${timelineOppositeContentClasses.root}`]: {
                  flex: 0.2,
                  minWidth: '120px',
                  px: 2,
                  py: 3
                }
              }}
            >
              {sortedPlans.map((plan, index) => (
                <TimelineItem key={plan.id}>
                  <TimelineOppositeContent>
                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      {formatPeriod(plan)}
                    </Typography>
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color={plan.type === 'rental' ? 'primary' : 'secondary'} sx={{ p: 1 }}>
                      {plan.type === 'rental' ? <ApartmentIcon /> : <HomeIcon />}
                    </TimelineDot>
                    {index < sortedPlans.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent sx={{ py: 1, px: 2, mb: 4 }}>
                    <Card variant="outlined" sx={{ '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(0,0,0,0.01)' } }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                          {plan.type === 'rental' ? (
                            <Box>
                              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                                <Typography
                                  sx={{ bgcolor: 'primary.main', color: 'white', px: 1, borderRadius: 1, fontSize: '0.8rem' }}
                                >
                                  賃貸
                                </Typography>
                              </Box>
                              <Typography>家賃 {formatCurrency(plan.rental.fee)}円</Typography>
                              <Typography>更新料 {formatCurrency(plan.rental.renewalFee)}円</Typography>
                              <Typography>更新頻度 {plan.rental.renewalFrequency ?? '-'}年</Typography>
                            </Box>
                          ) : (
                            <Box sx={{ flexGrow: 1 }}>
                              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    gap: 2,
                                    alignItems: 'center'
                                  }}
                                >
                                  <Typography
                                    sx={{ bgcolor: 'secondary.main', color: 'white', px: 1, borderRadius: 1, fontSize: '0.8rem' }}
                                  >
                                    持ち家
                                  </Typography>
                                </Box>
                                <Typography variant="h6" color="primary.main" sx={{ fontSize: '1.1rem' }}>
                                  月々合計:{' '}
                                  {(
                                    plan.own.loans.reduce(
                                      (acc, loan) =>
                                        acc +
                                        calculateMonthlyPayment(
                                          loan.amount,
                                          loan.period,
                                          loan.interestRate,
                                          loan.repaymentType
                                        ),
                                      0
                                    ) / 10000
                                  ).toLocaleString(undefined, { maximumFractionDigits: 1 })}{' '}
                                  万円
                                </Typography>
                              </Box>

                              {plan.own.buildingType === 'mansion' && (
                                <Typography sx={{ mt: 0.5, mb: 1 }} variant="body2" color="text.secondary">
                                  マンション: 管理費 {formatCurrency(plan.own.managementFee)}万円/月 / 修繕積立金{' '}
                                  {formatCurrency(plan.own.repairReserveFee)}万円/月 / 固定資産税{' '}
                                  {formatCurrency(plan.own.propertyTaxYearly)}万円/年
                                </Typography>
                              )}
                              {plan.own.buildingType === 'house' && (
                                <Typography sx={{ mt: 0.5, mb: 1 }} variant="body2" color="text.secondary">
                                  戸建: 修繕積立 {formatCurrency(plan.own.houseRepairReserveFee)}万円/月 / 固定資産税{' '}
                                  {formatCurrency(plan.own.propertyTaxYearly)}万円/年
                                </Typography>
                              )}
                              <Typography>{plan.own.loanMode === 'pair' ? 'ペアローン' : '単身ローン'}</Typography>
                              <Box>
                                {plan.own.loans.map((loan) => {
                                  const amount = formatCurrency(loan.amount)
                                  const period = loan.period ? `${loan.period}年` : '-'
                                  const rateType =
                                    loan.rateType === 'fixed' ? '固定' : loan.rateType === 'variable' ? '変動' : '-'
                                  const repaymentType =
                                    loan.repaymentType === 'equal-principal-interest'
                                      ? '元利均等返済'
                                      : loan.repaymentType === 'equal-principal'
                                        ? '元金均等返済'
                                        : '-'
                                  const interest = loan.interestRate ?? '-'
                                  return (
                                    <Box key={loan.id}>
                                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                        <Typography sx={{ fontWeight: 'bold' }}>{getLoanDisplayName(loan.name)}</Typography>
                                        <Typography>{amount}円</Typography>
                                        <Typography>{period}</Typography>
                                        <Typography>{rateType}</Typography>
                                        <Typography>{repaymentType}</Typography>
                                        <Typography>{interest}%</Typography>
                                      </Box>
                                      <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                                        月々返済額:{' '}
                                        {(
                                          calculateMonthlyPayment(
                                            loan.amount,
                                            loan.period,
                                            loan.interestRate,
                                            loan.repaymentType
                                          ) / 10000
                                        ).toLocaleString(undefined, { maximumFractionDigits: 1 })}{' '}
                                        万円
                                      </Typography>
                                    </Box>
                                  )
                                })}
                              </Box>
                            </Box>
                          )}
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton aria-label="edit" onClick={() => editPlan(plan.id)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton aria-label="delete" onClick={() => deletePlan(plan.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          )}
        </Stack>
      </Box>
    </Box>
  )
}
