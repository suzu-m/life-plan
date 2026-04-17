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
import Navi from '@/components/common/Navi'
import NumberField from '@/components/common/NumberField'
import RentalCard from '@/components/feature/expense/RentalCard'
import OwnCard from '@/components/feature/expense/OwnCard'
import { useHomeStore, type HomePlan } from '@/store/useHomeStore'

/**
 * 通貨形式で金額をフォーマットする
 * @param amount
 * @returns
 */
function formatCurrency(amount: number | null) {
  if (amount === null) {
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

          {sortedPlans.map((plan) => (
            <Card key={plan.id} variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                  {plan.type === 'rental' ? (
                    <Box>
                      <Typography>{formatPeriod(plan)}</Typography>
                      <Typography>賃貸</Typography>
                      <Typography>家賃 {formatCurrency(plan.rental.fee)}円</Typography>
                      <Typography>更新料 {formatCurrency(plan.rental.renewalFee)}円</Typography>
                      <Typography>更新頻度 {plan.rental.renewalFrequency ?? '-'}年</Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Typography>{formatPeriod(plan)}</Typography>
                        <Typography>持ち家</Typography>
                      </Box>
                      <Typography>{plan.own.loanMode === 'pair' ? 'ペアローン' : '単身ローン'}</Typography>
                      {plan.own.buildingType === 'mansion' && (
                        <Typography sx={{ mt: 0.5, mb: 1 }} variant="body2" color="text.secondary">
                          マンション: 管理費 {formatCurrency(plan.own.managementFee)}万円/月 / 修繕積立金{' '}
                          {formatCurrency(plan.own.repairReserveFee)}万円/月
                        </Typography>
                      )}
                      {plan.own.buildingType === 'house' && (
                        <Typography sx={{ mt: 0.5, mb: 1 }} variant="body2" color="text.secondary">
                          戸建: 修繕積立 {formatCurrency(plan.own.houseRepairReserveFee)}万円/月
                        </Typography>
                      )}
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
                            <Box key={loan.id} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                              <Typography>{loan.name}</Typography>
                              <Typography>{amount}円</Typography>
                              <Typography>{period}</Typography>
                              <Typography>{rateType}</Typography>
                              <Typography>{repaymentType}</Typography>
                              <Typography>{interest}%</Typography>
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
          ))}
        </Stack>
      </Box>
    </Box>
  )
}
