import Box from '@mui/material/Box'
import NumberField from '@/components/common/NumberField'
import type { RentalPlanData } from '@/store/useHomeStore'

type RentalCardProps = {
  value: RentalPlanData
  onChange: (value: Partial<RentalPlanData>) => void
}

export default function RentalCard({ value, onChange }: RentalCardProps) {
  return (
    // 数値入力を横並びにして、賃貸条件をひとまとまりで編集する。
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <NumberField
        label="家賃（管理費込み）"
        value={value.fee ?? 0}
        min={0}
        onValueChange={(nextValue) => {
          onChange({
            fee: nextValue === null ? null : Number(nextValue)
          })
        }}
      />
      <NumberField
        label="更新料"
        value={value.renewalFee ?? 0}
        min={0}
        onValueChange={(nextValue) => {
          onChange({
            renewalFee: nextValue === null ? null : Number(nextValue)
          })
        }}
      />
      <NumberField
        label="更新頻度（年）"
        value={value.renewalFrequency ?? 0}
        min={0}
        onValueChange={(nextValue) => {
          onChange({
            renewalFrequency: nextValue === null ? null : Number(nextValue)
          })
        }}
      />
    </Box>
  )
}
