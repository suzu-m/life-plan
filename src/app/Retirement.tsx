import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Navi from '@/components/common/Navi'
import NumberField from '@/components/common/NumberField'
import { useRetirementStore } from '@/store/useRetirementStore'

/**
 * 老後設定画面
 * 年金受給額や受給開始年齢、老後の生活費を設定する
 */
const Retirement = () => {
  const plan = useRetirementStore()

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Navi />
      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 } }}>
        <Box sx={{ mx: 'auto' }}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
            老後設定
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            将来の年金収入や、定年後の生活費をシミュレーションに反映させます。
          </Typography>

          <Stack spacing={3}>
            {/* 年金設定 */}
            <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Box component="span" sx={{ width: 4, height: 24, bgcolor: 'primary.main', borderRadius: 1 }} />
                  公的年金の設定
                </Typography>
                <Stack spacing={4}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                      本人
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                      <NumberField
                        label="受給年金額（月額/万円）"
                        value={plan.selfPensionMonthly}
                        onValueChange={(v) => plan.setRetirement({ selfPensionMonthly: v ?? 0 })}
                        width={240}
                        helperText="将来受け取る予定の月額"
                      />
                      <NumberField
                        label="受給開始年齢"
                        value={plan.selfPensionStartAge}
                        onValueChange={(v) => plan.setRetirement({ selfPensionStartAge: v ?? 65 })}
                        width={180}
                        min={60}
                        max={75}
                        helperText="通常は65歳から"
                      />
                    </Stack>
                  </Box>

                  <Divider sx={{ borderStyle: 'dashed' }} />

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2, color: 'secondary.main', fontWeight: 'bold' }}>
                      配偶者
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                      <NumberField
                        label="受給年金額（月額/万円）"
                        value={plan.spousePensionMonthly}
                        onValueChange={(v) => plan.setRetirement({ spousePensionMonthly: v ?? 0 })}
                        width={240}
                        helperText="将来受け取る予定の月額"
                      />
                      <NumberField
                        label="受給開始年齢"
                        value={plan.spousePensionStartAge}
                        onValueChange={(v) => plan.setRetirement({ spousePensionStartAge: v ?? 65 })}
                        width={180}
                        min={60}
                        max={75}
                        helperText="通常は65歳から"
                      />
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* 生活費設定 */}
            <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Box component="span" sx={{ width: 4, height: 24, bgcolor: 'warning.main', borderRadius: 1 }} />
                  老後の生活費
                </Typography>
                <Box>
                  <NumberField
                    label="老後の生活費（月額/万円）"
                    value={plan.retirementLivingExpenseMonthly}
                    onValueChange={(v) => plan.setRetirement({ retirementLivingExpenseMonthly: v ?? 0 })}
                    width={240}
                    helperText="定年退職後の生活費（世帯全体）"
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: 'rgba(255, 152, 0, 0.05)',
                      borderRadius: 1,
                      borderLeft: '3px solid',
                      borderColor: 'warning.main'
                    }}
                  >
                    ※この設定は「収入入力」画面で設定した本人の退職年齢に達した翌年から適用されます。
                    それまでは「生活費」画面の設定が適用されます。
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}

export default Retirement
