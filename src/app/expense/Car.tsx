import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import Navi from '@/components/common/Navi'
import NumberField from '@/components/common/NumberField'
import { useCarStore } from '@/store/useCarStore'

export default function ExpenseCar() {
  const { cars, draft, editingCarId, updateDraft, saveDraftCar, editCar, deleteCar, resetDraft } = useCarStore()

  const sortedCars = [...cars.entries()].sort(([a], [b]) => a - b)
  const isDraftValid = draft.name.trim() !== '' && draft.purchaseYear !== null

  /**
   * ローン月額を計算する
   */
  const calculateLoanAmount = (data: typeof draft): number => {
    const P = (data.carPrice ?? 0) - (data.downPayment ?? 0)
    const n = data.loanPayments ?? 0
    const FV = data.zankureFinalAmount ?? 0
    const annualRate = data.loanInterestRate ?? 0

    if (P <= 0 || n <= 0) return 0

    const r = annualRate / 100 / 12
    if (r === 0) {
      return Math.round(((P - FV) / n) * 100) / 100
    }

    // 元利均等返済 (残価設定対応)
    // Monthly = [(P - FV / (1+r)^n) * r / (1 - (1+r)^-n)]
    const monthly = ((P - FV / Math.pow(1 + r, n)) * r) / (1 - Math.pow(1 + r, -n))
    return Math.round(monthly * 100) / 100
  }

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
          支出：車
        </Typography>
        <Typography color="text.secondary" sx={{ marginBottom: 3 }}>
          車の購入ローンや維持費（車検、税金など）を設定します。複数台登録することも可能です。
        </Typography>

        {editingCarId !== null && (
          <Typography color="primary" sx={{ marginBottom: 2 }}>
            編集モードです。内容を変更して「この内容で更新」を押してください。
          </Typography>
        )}

        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Stack spacing={4}>
                {/* 基本情報 */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    車の基本情報
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'start' }}>
                    <TextField
                      required
                      label="車の名前"
                      value={draft.name}
                      onChange={(e) => updateDraft({ name: e.target.value })}
                      sx={{ width: '400px' }}
                    />
                    <NumberField
                      label="購入年"
                      value={draft.purchaseYear ?? 0}
                      onValueChange={(value) => updateDraft({ purchaseYear: value === null ? null : Number(value) })}
                      helperText="西暦で入力"
                    />
                  </Box>
                </Box>

                {/* ローン情報 */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    ローン設定
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'start' }}>
                    <NumberField
                      label="車の総額（万円）"
                      value={draft.carPrice ?? 0}
                      min={0}
                      width={180}
                      onValueChange={(value) => {
                        const next = { ...draft, carPrice: value === null ? null : Number(value) }
                        const monthly = calculateLoanAmount(next)
                        updateDraft({ ...next, loanMonthlyAmount: monthly })
                      }}
                      helperText="諸経費込み"
                    />
                    <NumberField
                      label="頭金（万円）"
                      value={draft.downPayment ?? 0}
                      min={0}
                      width={180}
                      onValueChange={(value) => {
                        const next = { ...draft, downPayment: value === null ? null : Number(value) }
                        const monthly = calculateLoanAmount(next)
                        updateDraft({ ...next, loanMonthlyAmount: monthly })
                      }}
                    />
                    <NumberField
                      label="ローン回数（月数）"
                      value={draft.loanPayments ?? 0}
                      min={0}
                      width={180}
                      onValueChange={(value) => {
                        const next = { ...draft, loanPayments: value === null ? null : Number(value) }
                        const monthly = calculateLoanAmount(next)
                        updateDraft({ ...next, loanMonthlyAmount: monthly })
                      }}
                      helperText="例: 60回"
                    />
                    <NumberField
                      label="ローン利率（%）"
                      value={draft.loanInterestRate ?? 0}
                      min={0}
                      width={180}
                      onValueChange={(value) => {
                        const next = { ...draft, loanInterestRate: value === null ? null : Number(value) }
                        const monthly = calculateLoanAmount(next)
                        updateDraft({ ...next, loanMonthlyAmount: monthly })
                      }}
                      helperText="年利を入力"
                    />
                    <NumberField
                      label="残価設定（万円）"
                      value={draft.zankureFinalAmount ?? 0}
                      min={0}
                      width={180}
                      onValueChange={(value) => {
                        const next = { ...draft, zankureFinalAmount: value === null ? null : Number(value) }
                        const monthly = calculateLoanAmount(next)
                        updateDraft({ ...next, loanMonthlyAmount: monthly })
                      }}
                      helperText="最終回支払額"
                    />
                    <NumberField
                      label="ローン月額（万円/月）"
                      value={draft.loanMonthlyAmount ?? 0}
                      min={0}
                      width={200}
                      onValueChange={(value) =>
                        updateDraft({ loanMonthlyAmount: value === null ? null : Number(value) })
                      }
                      helperText="自動計算（手入力可）"
                      sx={{ bgcolor: 'action.hover' }}
                    />
                  </Box>
                </Box>

                {/* 維持費情報 */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    維持費
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'start' }}>
                    <FormControl sx={{ minWidth: 140 }}>
                      <InputLabel>新車/中古車</InputLabel>
                      <Select
                        value={draft.isNewCar ? 'new' : 'used'}
                        label="新車/中古車"
                        onChange={(e) => updateDraft({ isNewCar: e.target.value === 'new' })}
                      >
                        <MenuItem value="new">新車</MenuItem>
                        <MenuItem value="used">中古車</MenuItem>
                      </Select>
                    </FormControl>

                    <NumberField
                      label="車検費用（万円/回）"
                      value={draft.shakenAmount ?? 0}
                      min={0}
                      width={200}
                      onValueChange={(value) => updateDraft({ shakenAmount: value === null ? null : Number(value) })}
                      helperText={draft.isNewCar ? '初回3年、以降2年毎' : '2年ごと発生'}
                    />

                    <NumberField
                      label="自動車税（万円/年）"
                      value={draft.taxYearlyAmount ?? 0}
                      min={0}
                      width={200}
                      onValueChange={(value) => updateDraft({ taxYearlyAmount: value === null ? null : Number(value) })}
                    />

                    <NumberField
                      label="その他維持費（万円/年）"
                      value={draft.maintenanceYearlyAmount ?? 0}
                      min={0}
                      width={200}
                      onValueChange={(value) =>
                        updateDraft({ maintenanceYearlyAmount: value === null ? null : Number(value) })
                      }
                      helperText="保険、ガソリン代など"
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button variant="text" onClick={resetDraft}>
                    {editingCarId !== null ? '編集をキャンセル' : '入力をリセット'}
                  </Button>
                  <Button variant="contained" onClick={saveDraftCar} disabled={!isDraftValid}>
                    {editingCarId !== null ? 'この内容で更新' : 'この内容で追加'}
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {sortedCars.map(([carId, car]) => (
            <Card key={carId} variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontSize: '1.1rem', mb: 1 }}>
                      {car.name || '名前なし'}
                      <Typography component="span" color="text.secondary" sx={{ ml: 1, fontSize: '0.9rem' }}>
                        ({car.purchaseYear ? `${car.purchaseYear}年購入` : '購入年未設定'})
                      </Typography>
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      総額: {car.carPrice ?? 0}万円 (頭金: {car.downPayment ?? 0}万円) / 金利:{' '}
                      {car.loanInterestRate ?? 0}% / ローン: {car.loanPayments ?? 0}
                      回払い / 月額 {car.loanMonthlyAmount ?? 0}万円
                      {car.zankureFinalAmount ? ` (残価: ${car.zankureFinalAmount}万円)` : ''}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      維持費: 車検 {car.shakenAmount ?? 0}万円 ({car.isNewCar ? '新車' : '中古車'}) 、 税金{' '}
                      {car.taxYearlyAmount ?? 0}万円/年 、 その他 {car.maintenanceYearlyAmount ?? 0}万円/年
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton aria-label="edit" onClick={() => editCar(carId)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton aria-label="delete" onClick={() => deleteCar(carId)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>

        <Button variant="contained" sx={{ marginTop: 2 }} href="/expense/living">
          次へ（支出：生活費）
        </Button>
      </Box>
    </Box>
  )
}
