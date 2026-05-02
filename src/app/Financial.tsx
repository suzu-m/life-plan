import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Navi from '@/components/common/Navi'
import NumberField from '@/components/common/NumberField'
import { useFinancialStore } from '@/store/useFinancialStore'

/**
 * 運用・控除設定画面
 */
export default function Financial() {
  const {
    investmentYield,
    furusatoNozeiAmount,
    mortgageDeductionEnabled,
    otherDeductionsAmount,
    updateSettings,
    reset
  } = useFinancialStore()

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
                資産運用設定
              </Typography>
              <Stack spacing={3}>
                <Box>
                  <NumberField
                    label="期待運用利回り（年率/%）"
                    value={investmentYield ?? 0}
                    min={0}
                    max={20}
                    step={0.1}
                    width={240}
                    onValueChange={(value) => updateSettings({ investmentYield: value === null ? null : Number(value) })}
                    helperText="資産全体に対する平均的な利回りを入力してください。"
                  />
                  <Alert severity="info" sx={{ mt: 2 }}>
                    一般的に、NISAやiDeCoなどを活用したインデックス投資では年率 3%〜5% 程度が目安とされます。
                  </Alert>
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
