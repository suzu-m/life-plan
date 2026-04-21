import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { type SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Navi from '@/components/common/Navi'
import NumberField from '@/components/common/NumberField'
import { useIncomeStore, type Occupation, type MemberIncome } from '@/store/useIncomeStore'

/**
 * メンバーごとの収入入力フォーム
 */
const MemberIncomeForm = ({
  title,
  data,
  onChange
}: {
  title: string
  data: MemberIncome
  onChange: (value: Partial<MemberIncome>) => void
}) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'start' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id={`${title}-occupation-label`}>職業</InputLabel>
              <Select
                labelId={`${title}-occupation-label`}
                id={`${title}-occupation`}
                value={data.occupation}
                label="職業"
                onChange={(e: SelectChangeEvent) =>
                  onChange({ occupation: e.target.value as Occupation })
                }
              >
                <MenuItem value="employee">会社員・公務員</MenuItem>
                <MenuItem value="self-employed">自営業・フリーランス</MenuItem>
                <MenuItem value="other">その他</MenuItem>
              </Select>
            </FormControl>

            <NumberField
              label="年収（額面/万円）"
              value={data.annualSalary ?? 0}
              min={0}
              width={200}
              onValueChange={(value) =>
                onChange({ annualSalary: value === null ? null : Number(value) })
              }
            />

            {data.occupation === 'employee' && (
              <>
                <NumberField
                  label="退職金（予定/万円）"
                  value={data.retirementAllowance ?? 0}
                  min={0}
                  width={200}
                  onValueChange={(value) =>
                    onChange({ retirementAllowance: value === null ? null : Number(value) })
                  }
                  helperText="定年退職時に受け取る想定額"
                />
                <NumberField
                  label="何歳まで働くか"
                  value={data.retirementAge ?? 60}
                  min={0}
                  max={100}
                  width={200}
                  onValueChange={(value) =>
                    onChange({ retirementAge: value === null ? null : Number(value) })
                  }
                  helperText="定年退職の予定年齢"
                />
              </>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default function Income() {
  const {
    main,
    partner,
    assets,
    passiveIncome,
    updateMain,
    updatePartner,
    updateAssets,
    updatePassiveIncome,
    reset
  } = useIncomeStore()

  // 世帯の年間合計収入の計算
  const yearlyTotal =
    (main.annualSalary ?? 0) + (partner.annualSalary ?? 0) + (passiveIncome ?? 0)

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
          収入
        </Typography>
        <Typography color="text.secondary" sx={{ marginBottom: 3 }}>
          世帯の収入や現在の資産状況を入力してください。
        </Typography>

        <Stack spacing={3}>
          {/* 合計サマリー */}
          <Card sx={{ backgroundColor: 'success.main', color: 'success.contrastText' }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                世帯の年間合計収入
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {yearlyTotal.toLocaleString()}
                </Typography>
                <Typography variant="h6" sx={{ ml: 1, opacity: 0.9 }}>
                  万円 / 年
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                (本人: {main.annualSalary ?? 0}万 + 配偶者: {partner.annualSalary ?? 0}万 + 不労所得:{' '}
                {passiveIncome ?? 0}万)
              </Typography>
            </CardContent>
          </Card>

          <MemberIncomeForm title="本人" data={main} onChange={updateMain} />
          <MemberIncomeForm title="配偶者・パートナー" data={partner} onChange={updatePartner} />

          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                現在の資産
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <NumberField
                  label="銀行預金（万円）"
                  value={assets.bankSavings ?? 0}
                  min={0}
                  width={200}
                  onValueChange={(value) =>
                    updateAssets({ bankSavings: value === null ? null : Number(value) })
                  }
                />
                <NumberField
                  label="NISA（万円）"
                  value={assets.nisa ?? 0}
                  min={0}
                  width={200}
                  onValueChange={(value) =>
                    updateAssets({ nisa: value === null ? null : Number(value) })
                  }
                />
                <NumberField
                  label="iDeCo（万円）"
                  value={assets.ideco ?? 0}
                  min={0}
                  width={200}
                  onValueChange={(value) =>
                    updateAssets({ ideco: value === null ? null : Number(value) })
                  }
                />
                <NumberField
                  label="その他投資（万円）"
                  value={assets.otherInvestments ?? 0}
                  min={0}
                  width={200}
                  onValueChange={(value) =>
                    updateAssets({ otherInvestments: value === null ? null : Number(value) })
                  }
                />
              </Box>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                その他
              </Typography>
              <NumberField
                label="不労所得（年額/万円）"
                value={passiveIncome ?? 0}
                min={0}
                width={200}
                onValueChange={(value) => updatePassiveIncome(value === null ? null : Number(value))}
                helperText="家賃収入、配当金など"
              />
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button color="error" onClick={reset}>
              入力をリセット
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
