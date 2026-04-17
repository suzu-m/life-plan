import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Navi from '@/components/common/Navi'
import NumberField from '@/components/common/NumberField'
import { useLivingStore } from '@/store/useLivingStore'

export default function ExpenseLiving() {
  const { plan, updatePlan, resetPlan } = useLivingStore()

  // 合計金額の計算
  const monthlyTotal =
    (plan.foodMonthlyAmount ?? 0) +
    (plan.utilitiesMonthlyAmount ?? 0) +
    (plan.telecomMonthlyAmount ?? 0) +
    (plan.insuranceMonthlyAmount ?? 0) +
    (plan.hobbiesMonthlyAmount ?? 0) +
    (plan.otherMonthlyAmount ?? 0) +
    (plan.allowanceMainMonthlyAmount ?? 0) +
    (plan.allowancePartnerMonthlyAmount ?? 0)

  const yearlyTotal = monthlyTotal * 12

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
          支出：生活費
        </Typography>
        <Typography color="text.secondary" sx={{ marginBottom: 3 }}>
          食費や光熱費など、毎月かかる基礎的な生活コストを入力してください。
        </Typography>

        <Stack spacing={3}>
          {/* 合計サマリー */}
          <Card sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText' }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                基本生活費の合計
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {monthlyTotal.toLocaleString()}
                </Typography>
                <Typography variant="h6" sx={{ ml: 1, opacity: 0.9 }}>
                  万円 / 月
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
                （年額換算： {yearlyTotal.toLocaleString()} 万円 / 年）
              </Typography>
            </CardContent>
          </Card>

          {/* 入力フォーム */}
          <Card>
            <CardContent>
              <Stack spacing={4}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    各項目の月額（万円）
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'start' }}>
                    <NumberField
                      label="食費"
                      value={plan.foodMonthlyAmount ?? 0}
                      min={0}
                      width={200}
                      onValueChange={(value) =>
                        updatePlan({ foodMonthlyAmount: value === null ? null : Number(value) })
                      }
                      helperText="外食・カフェ代も含む"
                    />

                    <NumberField
                      label="水道光熱費"
                      value={plan.utilitiesMonthlyAmount ?? 0}
                      min={0}
                      width={200}
                      onValueChange={(value) =>
                        updatePlan({ utilitiesMonthlyAmount: value === null ? null : Number(value) })
                      }
                      helperText="電気・ガス・水道"
                    />

                    <NumberField
                      label="通信費"
                      value={plan.telecomMonthlyAmount ?? 0}
                      min={0}
                      width={200}
                      onValueChange={(value) =>
                        updatePlan({ telecomMonthlyAmount: value === null ? null : Number(value) })
                      }
                      helperText="スマホ、ネット回線費用など"
                    />

                    <NumberField
                      label="保険料"
                      value={plan.insuranceMonthlyAmount ?? 0}
                      min={0}
                      width={200}
                      onValueChange={(value) =>
                        updatePlan({ insuranceMonthlyAmount: value === null ? null : Number(value) })
                      }
                      helperText="生命保険、医療保険など（月換算）"
                    />

                    <NumberField
                      label="趣味・娯楽費"
                      value={plan.hobbiesMonthlyAmount ?? 0}
                      min={0}
                      width={200}
                      onValueChange={(value) =>
                        updatePlan({ hobbiesMonthlyAmount: value === null ? null : Number(value) })
                      }
                      helperText="遊び、旅行積立など"
                    />

                    <NumberField
                      label="日用品・その他"
                      value={plan.otherMonthlyAmount ?? 0}
                      min={0}
                      width={200}
                      onValueChange={(value) =>
                        updatePlan({ otherMonthlyAmount: value === null ? null : Number(value) })
                      }
                      helperText="日用雑貨、被服費など"
                    />

                    <NumberField
                      label="お小遣い（メイン）"
                      value={plan.allowanceMainMonthlyAmount ?? 0}
                      min={0}
                      width={200}
                      onValueChange={(value) =>
                        updatePlan({ allowanceMainMonthlyAmount: value === null ? null : Number(value) })
                      }
                    />

                    <NumberField
                      label="お小遣い（配偶者）"
                      value={plan.allowancePartnerMonthlyAmount ?? 0}
                      min={0}
                      width={200}
                      onValueChange={(value) =>
                        updatePlan({ allowancePartnerMonthlyAmount: value === null ? null : Number(value) })
                      }
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="text" onClick={resetPlan} color="error">
                    入力をすべてリセット
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        <Button variant="contained" sx={{ marginTop: 3 }} href="/expense/other">
          次へ（支出：その他費用）
        </Button>
      </Box>
    </Box>
  )
}
