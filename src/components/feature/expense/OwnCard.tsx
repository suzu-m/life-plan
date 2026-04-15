import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Select, { type SelectChangeEvent } from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import NumberField from '@/components/common/NumberField'
import type { LoanMode, OwnLoan, OwnPlanData, RateType, RepaymentType } from '@/store/useHomeStore'

type OwnCardProps = {
  value: OwnPlanData
  onLoanModeChange: (mode: LoanMode) => void
  onLoanChange: (loanId: number, value: Partial<OwnLoan>) => void
}

const LOAN_AMOUNT_UNIT = 10_000

function formatAmount(amount: number | null) {
  if (amount === null) return '未入力'
  return `${amount.toLocaleString()}円`
}

export default function OwnCard({ value, onLoanModeChange, onLoanChange }: OwnCardProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormControl>
        <Typography variant="subtitle2" sx={{ marginBottom: 1 }}>
          ローン種別
        </Typography>
        <RadioGroup row value={value.loanMode} onChange={(e) => onLoanModeChange(e.target.value as LoanMode)}>
          <FormControlLabel value="single" control={<Radio />} label="単身ローン" />
          <FormControlLabel value="pair" control={<Radio />} label="ペアローン" />
        </RadioGroup>
      </FormControl>

      {/* 単身なら1件、ペアローンなら2件の入力ブロックを並べる。 */}
      {value.loans.map((loan) => (
        <Box
          key={loan.id}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            padding: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
          <Typography variant="subtitle1">{loan.name}</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <NumberField
              label="借入額（万円単位）"
              value={loan.amount === null ? 0 : loan.amount / LOAN_AMOUNT_UNIT}
              min={0}
              step={1}
              helperText={`保存値: ${formatAmount(loan.amount)}`}
              onValueChange={(nextValue) => {
                onLoanChange(loan.id, {
                  // 入力は万円単位だが、保存値は実額で持つ。
                  amount: nextValue === null ? null : Number(nextValue) * LOAN_AMOUNT_UNIT
                })
              }}
            />
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel id={`period-label-${loan.id}`}>返済期間</InputLabel>
              <Select
                labelId={`period-label-${loan.id}`}
                id={`period-${loan.id}`}
                value={loan.period?.toString() ?? ''}
                label="返済期間"
                onChange={(e: SelectChangeEvent) =>
                  onLoanChange(loan.id, {
                    period: e.target.value ? Number(e.target.value) : null
                  })
                }
              >
                <MenuItem value="25">25年</MenuItem>
                <MenuItem value="30">30年</MenuItem>
                <MenuItem value="35">35年</MenuItem>
                <MenuItem value="40">40年</MenuItem>
                <MenuItem value="45">45年</MenuItem>
                <MenuItem value="50">50年</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel id={`rate-type-label-${loan.id}`}>金利タイプ</InputLabel>
              <Select
                labelId={`rate-type-label-${loan.id}`}
                id={`rate-type-${loan.id}`}
                value={loan.rateType}
                label="金利タイプ"
                onChange={(e: SelectChangeEvent) =>
                  onLoanChange(loan.id, {
                    rateType: e.target.value as RateType
                  })
                }
              >
                <MenuItem value="fixed">固定金利</MenuItem>
                <MenuItem value="variable">変動金利</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 190 }}>
              <InputLabel id={`repayment-type-label-${loan.id}`}>返済方式</InputLabel>
              <Select
                labelId={`repayment-type-label-${loan.id}`}
                id={`repayment-type-${loan.id}`}
                value={loan.repaymentType}
                label="返済方式"
                onChange={(e: SelectChangeEvent) =>
                  onLoanChange(loan.id, {
                    repaymentType: e.target.value as RepaymentType
                  })
                }
              >
                <MenuItem value="equal-principal-interest">元利均等返済</MenuItem>
                <MenuItem value="equal-principal">元金均等返済</MenuItem>
              </Select>
            </FormControl>
            <NumberField
              label="金利（%）"
              value={loan.interestRate ?? 0}
              min={0}
              step={0.01}
              onValueChange={(nextValue) => {
                onLoanChange(loan.id, {
                  interestRate: nextValue === null ? null : Number(nextValue)
                })
              }}
            />
          </Box>
        </Box>
      ))}
    </Box>
  )
}
