import * as React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import Navi from '@/components/common/Navi'
import NumberField from '@/components/common/NumberField'
import { useFinancialStore, type InvestmentPlan } from '@/store/useFinancialStore'
import { useHomeStore } from '@/store/useHomeStore'
import { calculateMortgageDeduction } from '@/utils/loan'
import { formatCurrency } from '@/utils/format'

/**
 * 運用・控除設定画面
 */
export default function Financial() {
  const {
    nisaInitial,
    idecoInitial,
    otherInvestmentsInitial,
    investmentYield,
    investmentPlans,
    furusatoNozeiAmount,
    mortgageDeductionEnabled,
    otherDeductionsAmount,
    updateSettings,
    reset
  } = useFinancialStore()
  const { plans: homePlans } = useHomeStore()

  const handleAddPlan = () => {
    const newPlan: InvestmentPlan = {
      id: Date.now(),
      startYear: new Date().getFullYear(),
      endYear: null,
      monthlyAmount: 3
    }
    updateSettings({ investmentPlans: [...investmentPlans, newPlan] })
  }

  const handleUpdatePlan = (id: number, value: Partial<InvestmentPlan>) => {
    updateSettings({
      investmentPlans: investmentPlans.map((p) => (p.id === id ? { ...p, ...value } : p))
    })
  }

  const handleRemovePlan = (id: number) => {
    updateSettings({
      investmentPlans: investmentPlans.filter((p) => p.id !== id)
    })
  }

  /**
   * 住宅ローン控除の試算データを生成
   */
  const mortgageDeductions = React.useMemo(() => {
    const ownPlan = homePlans.find((p) => p.type === 'own')
    if (!ownPlan || !ownPlan.fromYear) return []

    const deductions = []
    for (let i = 0; i < 13; i++) {
      const year = ownPlan.fromYear + i
      let yearlyAmount = 0
      ownPlan.own.loans.forEach((loan) => {
        yearlyAmount += calculateMortgageDeduction(loan, i)
      })
      if (yearlyAmount > 0) {
        deductions.push({ year, amount: yearlyAmount })
      }
    }
    return deductions
  }, [homePlans])

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
          運用・控除
        </Typography>
        <Typography color="text.secondary" sx={{ marginBottom: 3 }}>
          資産運用の利回りや、税金控除に関する設定を行います。
        </Typography>

        <Stack spacing={4}>
          {/* 資産運用の設定 */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                資産運用・投資設定
              </Typography>
              <Stack spacing={4}>
                {/* 現在の資産残高 */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold' }}>
                    現在の投資資産残高
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                    <NumberField
                      label="NISA残高 (万円)"
                      value={nisaInitial ?? 0}
                      min={0}
                      width={180}
                      onValueChange={(v) => updateSettings({ nisaInitial: v })}
                    />
                    <NumberField
                      label="iDeCo残高 (万円)"
                      value={idecoInitial ?? 0}
                      min={0}
                      width={180}
                      onValueChange={(v) => updateSettings({ idecoInitial: v })}
                    />
                    <NumberField
                      label="その他投資 (万円)"
                      value={otherInvestmentsInitial ?? 0}
                      min={0}
                      width={180}
                      onValueChange={(v) => updateSettings({ otherInvestmentsInitial: v })}
                    />
                  </Stack>
                </Box>

                <Divider />

                {/* 利回り設定 */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold' }}>
                    運用利回り設定
                  </Typography>
                  <NumberField
                    label="期待運用利回り（年率/%）"
                    value={investmentYield ?? 0}
                    min={0}
                    max={20}
                    step={0.1}
                    width={240}
                    onValueChange={(value) => updateSettings({ investmentYield: value })}
                    helperText="上記の投資資産に対して適用される平均的な利回りを入力してください。"
                  />
                  <Alert severity="info" sx={{ mt: 2 }}>
                    ※現預金（銀行預金）には利回りは適用されません。
                  </Alert>
                </Box>

                <Divider />

                {/* 積立プラン設定 */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      積立投資プラン（毎月の積み立て）
                    </Typography>
                    <Button startIcon={<AddIcon />} onClick={handleAddPlan} size="small">
                      プランを追加
                    </Button>
                  </Box>

                  {investmentPlans.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 1 }}>
                      積立設定はありません
                    </Typography>
                  ) : (
                    <Stack spacing={2}>
                      {investmentPlans.map((plan) => (
                        <Box key={plan.id} sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                            <NumberField
                              label="開始年"
                              value={plan.startYear}
                              min={2000}
                              width={120}
                              onValueChange={(v) => handleUpdatePlan(plan.id, { startYear: v || 0 })}
                            />
                            <Typography>〜</Typography>
                            <NumberField
                              label="終了年 (空で継続)"
                              value={plan.endYear}
                              min={2000}
                              width={140}
                              onValueChange={(v) => handleUpdatePlan(plan.id, { endYear: v })}
                            />
                            <NumberField
                              label="毎月の積立額 (万円)"
                              value={plan.monthlyAmount}
                              min={0}
                              width={180}
                              onValueChange={(v) => handleUpdatePlan(plan.id, { monthlyAmount: v || 0 })}
                            />
                            <IconButton color="error" onClick={() => handleRemovePlan(plan.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Stack>
                          <Box sx={{ mt: 1.5 }}>
                            <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
                              年間積立額: {(plan.monthlyAmount * 12).toLocaleString()} 万円
                              {plan.endYear && (
                                <>
                                  {' / '}
                                  期間合計: {(plan.monthlyAmount * 12 * (plan.endYear - plan.startYear + 1)).toLocaleString()} 万円
                                </>
                              )}
                              {!plan.endYear && ' / 継続的に積立'}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                    ※設定した金額が、毎月「銀行預金」から「投資資産」へ移動し、運用利回りの対象となります。
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* 控除の設定 */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                税金控除の設定
              </Typography>
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <NumberField
                    label="ふるさと納税（年間/万円）"
                    value={furusatoNozeiAmount ?? 0}
                    min={0}
                    width={240}
                    onValueChange={(value) => updateSettings({ furusatoNozeiAmount: value === null ? null : Number(value) })}
                    helperText="年間の寄付予定額を入力してください。"
                  />
                  <NumberField
                    label="その他控除（年間/万円）"
                    value={otherDeductionsAmount ?? 0}
                    min={0}
                    width={240}
                    onValueChange={(value) => updateSettings({ otherDeductionsAmount: value === null ? null : Number(value) })}
                    helperText="生命保険料控除、医療費控除など（還付額ではなく、控除額）"
                  />
                </Box>

                <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    住宅ローン控除
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={mortgageDeductionEnabled}
                        onChange={(e) => updateSettings({ mortgageDeductionEnabled: e.target.checked })}
                      />
                    }
                    label="住宅ローン控除をシミュレーションに含める"
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    ※持ち家のプランが設定されている場合に、返済開始から一定期間（最大13年）、ローン残高に応じた控除（還付）を簡易的に計算します。
                  </Typography>

                  {mortgageDeductionEnabled && mortgageDeductions.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        住宅ローン控除 試算表
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ backgroundColor: 'action.hover' }}>
                              <TableCell sx={{ fontWeight: 'bold' }}>年</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                控除額（年間）
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {mortgageDeductions.map((row) => (
                              <TableRow key={row.year}>
                                <TableCell>{row.year}年</TableCell>
                                <TableCell align="right">{formatCurrency(row.amount)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button color="error" onClick={reset}>
              設定をリセット
            </Button>
            <Button variant="contained" size="large" href="/results">
              結果を確認する
            </Button>
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}
