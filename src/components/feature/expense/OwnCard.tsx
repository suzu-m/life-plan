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
import type { LoanMode, OwnLoan, OwnPlanData, RateType, RepaymentType, BuildingType } from '@/store/useHomeStore'
import { calculateMonthlyPayment } from '@/utils/loan'

type OwnCardProps = {
  value: OwnPlanData
  onLoanModeChange: (mode: LoanMode) => void
  onLoanChange: (loanId: number, value: Partial<OwnLoan>) => void
  onOwnDetailsChange: (value: Partial<OwnPlanData>) => void
}

const LOAN_AMOUNT_UNIT = 10_000

function formatAmount(amount: number | null) {
  if (amount === null) return '未入力'
  return `${amount.toLocaleString()}円`
}

export default function OwnCard({ value, onLoanModeChange, onLoanChange, onOwnDetailsChange }: OwnCardProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormControl>
        <Typography variant="subtitle2" sx={{ marginBottom: 1 }}>
          建物種別
        </Typography>
        <RadioGroup
          row
          value={value.buildingType}
          onChange={(e) => onOwnDetailsChange({ buildingType: e.target.value as BuildingType })}
        >
          <FormControlLabel value="mansion" control={<Radio />} label="マンション" />
          <FormControlLabel value="house" control={<Radio />} label="戸建" />
        </RadioGroup>
      </FormControl>

      {value.buildingType === 'mansion' && (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <NumberField
            label="管理費（万円/月）"
            value={value.managementFee ?? 0}
            min={0}
            step={0.1}
            onValueChange={(nextValue) =>
              onOwnDetailsChange({ managementFee: nextValue === null ? null : Number(nextValue) })
            }
            helperText="月額を入力"
          />
          <NumberField
            label="修繕積立金（万円/月）"
            value={value.repairReserveFee ?? 0}
            min={0}
            step={0.1}
            onValueChange={(nextValue) =>
              onOwnDetailsChange({ repairReserveFee: nextValue === null ? null : Number(nextValue) })
            }
            helperText="月額を入力"
          />
          <NumberField
            label="固定資産税（万円/年）"
            value={value.propertyTaxYearly ?? 0}
            min={0}
            step={1}
            onValueChange={(nextValue) =>
              onOwnDetailsChange({ propertyTaxYearly: nextValue === null ? null : Number(nextValue) })
            }
            helperText="年額を入力"
          />
        </Box>
      )}

      {value.buildingType === 'house' && (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <NumberField
            label="修繕に向けた積み立て（万円/月）"
            value={value.houseRepairReserveFee ?? 0}
            min={0}
            step={0.1}
            onValueChange={(nextValue) =>
              onOwnDetailsChange({ houseRepairReserveFee: nextValue === null ? null : Number(nextValue) })
            }
            helperText="月額を入力"
          />
          <NumberField
            label="固定資産税（万円/年）"
            value={value.propertyTaxYearly ?? 0}
            min={0}
            step={1}
            onValueChange={(nextValue) =>
              onOwnDetailsChange({ propertyTaxYearly: nextValue === null ? null : Number(nextValue) })
            }
            helperText="年額を入力"
          />
        </Box>
      )}

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
      {value.loans.map((loan) => {
        const monthlyAmount = calculateMonthlyPayment(loan.amount, loan.period, loan.interestRate, loan.repaymentType)
        return (
          <Box
            key={loan.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              padding: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'rgba(0, 0, 0, 0.02)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {loan.name}
              </Typography>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  月々の返済額（目安）
                </Typography>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                  {(monthlyAmount / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })} 万円
                </Typography>
              </Box>
            </Box>

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
        )
      })}
    </Box>
  )
}
