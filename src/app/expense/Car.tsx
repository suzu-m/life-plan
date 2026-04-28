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
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import Timeline from '@mui/lab/Timeline'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineOppositeContent, { timelineOppositeContentClasses } from '@mui/lab/TimelineOppositeContent'
import Navi from '@/components/common/Navi'
import NumberField from '@/components/common/NumberField'
import { useCarStore } from '@/store/useCarStore'

export default function ExpenseCar() {
  const { cars, draft, editingCarId, updateDraft, saveDraftCar, editCar, deleteCar, resetDraft } = useCarStore()

  const sortedCars = [...cars.entries()].sort(([, a], [, b]) => {
    return (a.purchaseYear ?? 0) - (b.purchaseYear ?? 0)
  })
  const isDraftValid = draft.name.trim() !== '' && draft.purchaseYear !== null

  /**
   * 通貨形式で金額をフォーマットする
   */
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '-'
    return amount.toLocaleString()
  }

  /**
   * 期間をフォーマットする
   */
  const formatPeriod = (car: typeof draft) => {
    if (car.inputMode === 'rough') {
      return `${car.purchaseYear}年 - ${car.toYear ?? car.purchaseYear}年`
    }
    const endYear = car.toYear || car.purchaseYear! + (car.loanPayments ? Math.ceil(car.loanPayments / 12) : 0)
    return `${car.purchaseYear}年 - ${endYear}年`
  }

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
                  </Box>
                </Box>
                {/* モード切替 */}
                <Box sx={{ display: 'flex', justifyContent: 'start' }}>
                  <ToggleButtonGroup
                    value={draft.inputMode}
                    exclusive
                    onChange={(_, value) => value && updateDraft({ inputMode: value })}
                    aria-label="input mode"
                    color="primary"
                  >
                    <ToggleButton value="detailed" sx={{ px: 3 }}>
                      ローン入力
                    </ToggleButton>
                    <ToggleButton value="rough" sx={{ px: 3 }}>
                      ざっくり入力
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                {draft.inputMode === 'rough' ? (
                  /* ざっくり入力 */
                  <Box>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                      ざっくり設定
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'start' }}>
                      <NumberField
                        label="初期費用（万円）"
                        value={draft.roughInitialCost ?? 0}
                        min={0}
                        width={180}
                        onValueChange={(value) =>
                          updateDraft({ roughInitialCost: value === null ? null : Number(value) })
                        }
                        helperText="購入時の諸費用、頭金など"
                      />
                      <NumberField
                        label="毎月の目安（万円/月）"
                        value={draft.roughMonthlyAmount ?? 0}
                        min={0}
                        width={180}
                        onValueChange={(value) =>
                          updateDraft({ roughMonthlyAmount: value === null ? null : Number(value) })
                        }
                        helperText="ローン、維持費込みの目安"
                      />
                      <NumberField
                        label="月額費用の開始年"
                        value={draft.purchaseYear ?? 0}
                        onValueChange={(value) => updateDraft({ purchaseYear: value === null ? null : Number(value) })}
                        width={180}
                        helperText="費用が発生し始める年"
                      />
                      <NumberField
                        label="月額費用の終了年"
                        value={draft.toYear ?? 0}
                        min={draft.purchaseYear ?? 0}
                        width={180}
                        onValueChange={(value) => updateDraft({ toYear: value === null ? null : Number(value) })}
                        helperText="この費用が終了する年"
                      />
                    </Box>
                  </Box>
                ) : (
                  /* ローン情報 */
                  <Box>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                      ローン設定
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'start' }}>
                      <NumberField
                        label="購入年"
                        value={draft.purchaseYear ?? 0}
                        onValueChange={(value) => updateDraft({ purchaseYear: value === null ? null : Number(value) })}
                        width={180}
                        helperText="西暦で入力"
                      />
                      <NumberField
                        label="いつまで乗るか"
                        value={draft.toYear ?? 0}
                        min={draft.purchaseYear ?? 0}
                        width={180}
                        onValueChange={(value) => updateDraft({ toYear: value === null ? null : Number(value) })}
                        helperText="維持費の終了年"
                      />
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
                )}

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

          {sortedCars.length > 0 && (
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
              {sortedCars.map(([carId, car], index) => (
                <TimelineItem key={carId}>
                  <TimelineOppositeContent>
                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      {formatPeriod(car)}
                    </Typography>
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color="primary" sx={{ p: 1 }}>
                      <DirectionsCarIcon />
                    </TimelineDot>
                    {index < sortedCars.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent sx={{ py: 1, px: 2, mb: 4 }}>
                    <Card
                      variant="outlined"
                      sx={{ '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(0,0,0,0.01)' } }}
                    >
                      <CardContent>
                        <Box
                          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}
                        >
                          <Box>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                              <Typography variant="h6" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                {car.name || '名前なし'}
                              </Typography>
                              <Typography
                                sx={{
                                  bgcolor: car.inputMode === 'rough' ? 'success.main' : 'primary.main',
                                  color: 'white',
                                  px: 1,
                                  borderRadius: 1,
                                  fontSize: '0.75rem'
                                }}
                              >
                                {car.inputMode === 'rough' ? 'ざっくり' : 'ローン入力'}
                              </Typography>
                            </Box>

                            <Typography variant="body2" color="text.secondary">
                              {car.inputMode === 'rough' ? (
                                <>
                                  初期費用: {formatCurrency(car.roughInitialCost)}万円 / 毎月の目安:{' '}
                                  {formatCurrency(car.roughMonthlyAmount)}万円 / 期間: {car.purchaseYear}年 〜{' '}
                                  {car.toYear}年
                                </>
                              ) : (
                                <>
                                  総額: {formatCurrency(car.carPrice)}万円 (頭金: {formatCurrency(car.downPayment)}万円)
                                  / ローン: {car.loanPayments ?? 0}
                                  回払い / 月額 {formatCurrency(car.loanMonthlyAmount)}万円
                                  {car.zankureFinalAmount ? ` (残価: ${car.zankureFinalAmount}万円)` : ''}
                                </>
                              )}
                            </Typography>

                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              維持費: 車検 {formatCurrency(car.shakenAmount)}万円 ({car.isNewCar ? '新車' : '中古車'})
                              、 税金 {formatCurrency(car.taxYearlyAmount)}万円/年 、 その他{' '}
                              {formatCurrency(car.maintenanceYearlyAmount)}万円/年
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
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          )}
        </Stack>

        <Button variant="contained" sx={{ marginTop: 2 }} href="/expense/living">
          次へ（支出：生活費）
        </Button>
      </Box>
    </Box>
  )
}
