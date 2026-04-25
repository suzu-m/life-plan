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
import IconButton from '@mui/material/IconButton'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
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
                onChange={(e: SelectChangeEvent) => onChange({ occupation: e.target.value as Occupation })}
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
              onValueChange={(value) => onChange({ annualSalary: value === null ? null : Number(value) })}
            />

            {data.occupation === 'employee' && (
              <>
                <NumberField
                  label="退職金（予定/万円）"
                  value={data.retirementAllowance ?? 0}
                  min={0}
                  width={200}
                  onValueChange={(value) => onChange({ retirementAllowance: value === null ? null : Number(value) })}
                  helperText="定年退職時に受け取る想定額"
                />
                <NumberField
                  label="何歳まで働くか"
                  value={data.retirementAge ?? 60}
                  min={0}
                  max={100}
                  width={200}
                  onValueChange={(value) => onChange({ retirementAge: value === null ? null : Number(value) })}
                  helperText="定年退職の予定年齢"
                />
              </>
            )}
          </Box>

          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 'bold' }}>
              昇給設定
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'start' }}>
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel id={`${title}-increase-type-label`}>昇給の種類</InputLabel>
                <Select
                  labelId={`${title}-increase-type-label`}
                  value={data.salaryIncreaseType}
                  label="昇給の種類"
                  onChange={(e: SelectChangeEvent) =>
                    onChange({ salaryIncreaseType: e.target.value as 'amount' | 'rate' })
                  }
                >
                  <MenuItem value="rate">年率 (%)</MenuItem>
                  <MenuItem value="amount">定額 (万円)</MenuItem>
                </Select>
              </FormControl>
              <NumberField
                label={data.salaryIncreaseType === 'rate' ? '昇給率（%/年）' : '昇給額（万円/年）'}
                value={data.salaryIncreaseValue ?? 0}
                min={0.1}
                step={0.1}
                width={200}
                onValueChange={(value) => onChange({ salaryIncreaseValue: value === null ? null : Number(value) })}
                helperText={data.salaryIncreaseType === 'rate' ? '毎年◯%ずつアップ' : '毎年◯万円ずつアップ'}
              />
            </Box>
          </Box>

          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 'bold' }}>
              産休・育休の設定
            </Typography>
            <Stack spacing={2}>
              {(data.leavePeriods ?? []).map((period) => (
                <Box key={period.id} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'start' }}>
                  <NumberField
                    size="small"
                    label="対象年"
                    value={period.year}
                    width={120}
                    onValueChange={(val) => {
                      const next = (data.leavePeriods ?? []).map((p) =>
                        p.id === period.id ? { ...p, year: val === null ? new Date().getFullYear() : Number(val) } : p
                      )
                      onChange({ leavePeriods: next })
                    }}
                  />
                  <NumberField
                    size="small"
                    label="期間（ヵ月）"
                    value={period.months}
                    min={1}
                    max={12}
                    width={120}
                    onValueChange={(val) => {
                      const next = (data.leavePeriods ?? []).map((p) =>
                        p.id === period.id ? { ...p, months: val === null ? 0 : Number(val) } : p
                      )
                      onChange({ leavePeriods: next })
                    }}
                  />
                  <NumberField
                    size="small"
                    label="給与補填率 (%)"
                    value={period.rate}
                    min={0}
                    max={100}
                    width={140}
                    onValueChange={(val) => {
                      const next = (data.leavePeriods ?? []).map((p) =>
                        p.id === period.id ? { ...p, rate: val === null ? 0 : Number(val) } : p
                      )
                      onChange({ leavePeriods: next })
                    }}
                    helperText="標準: 67% or 50%"
                  />
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => {
                      const next = (data.leavePeriods ?? []).filter((p) => p.id !== period.id)
                      onChange({ leavePeriods: next })
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                size="small"
                sx={{ alignSelf: 'flex-start' }}
                onClick={() => {
                  const periods = data.leavePeriods ?? []
                  const newId =
                    periods.length > 0 ? Math.max(...periods.map((p) => p.id)) + 1 : 0
                  const currentYear = new Date().getFullYear()
                  const next = [...periods, { id: newId, year: currentYear, months: 12, rate: 67 }]
                  onChange({ leavePeriods: next })
                }}
              >
                休暇期間を追加
              </Button>
            </Stack>
          </Box>

          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 'bold' }}>
              時短勤務の設定
            </Typography>
            <Stack spacing={2}>
              {(data.shortTimePeriods ?? []).map((period) => (
                <Box key={period.id} sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'start' }}>
                  <NumberField
                    size="small"
                    label="開始年"
                    value={period.startYear}
                    width={100}
                    onValueChange={(val) => {
                      const next = (data.shortTimePeriods ?? []).map((p) =>
                        p.id === period.id ? { ...p, startYear: val === null ? new Date().getFullYear() : Number(val) } : p
                      )
                      onChange({ shortTimePeriods: next })
                    }}
                  />
                  <Typography sx={{ alignSelf: 'center', color: 'text.secondary' }}>〜</Typography>
                  <NumberField
                    size="small"
                    label="終了年"
                    value={period.endYear}
                    width={100}
                    onValueChange={(val) => {
                      const next = (data.shortTimePeriods ?? []).map((p) =>
                        p.id === period.id ? { ...p, endYear: val === null ? new Date().getFullYear() : Number(val) } : p
                      )
                      onChange({ shortTimePeriods: next })
                    }}
                  />
                  <NumberField
                    size="small"
                    label="給与支払率 (%)"
                    value={period.rate}
                    min={0}
                    max={100}
                    width={120}
                    onValueChange={(val) => {
                      const next = (data.shortTimePeriods ?? []).map((p) =>
                        p.id === period.id ? { ...p, rate: val === null ? 0 : Number(val) } : p
                      )
                      onChange({ shortTimePeriods: next })
                    }}
                    helperText="フルタイム=100"
                  />
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => {
                      const next = (data.shortTimePeriods ?? []).filter((p) => p.id !== period.id)
                      onChange({ shortTimePeriods: next })
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                size="small"
                sx={{ alignSelf: 'flex-start' }}
                onClick={() => {
                  const periods = data.shortTimePeriods ?? []
                  const newId =
                    periods.length > 0 ? Math.max(...periods.map((p) => p.id)) + 1 : 0
                  const currentYear = new Date().getFullYear()
                  const next = [...periods, { id: newId, startYear: currentYear, endYear: currentYear + 1, rate: 80 }]
                  onChange({ shortTimePeriods: next })
                }}
              >
                時短期間を追加
              </Button>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default function Income() {
  const { main, partner, assets, passiveIncome, updateMain, updatePartner, updateAssets, updatePassiveIncome, reset } =
    useIncomeStore()

  // 世帯の年間合計収入の計算
  const yearlyTotal = (main.annualSalary ?? 0) + (partner.annualSalary ?? 0) + (passiveIncome ?? 0)

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
                  onValueChange={(value) => updateAssets({ bankSavings: value === null ? null : Number(value) })}
                />
                <NumberField
                  label="NISA（万円）"
                  value={assets.nisa ?? 0}
                  min={0}
                  width={200}
                  onValueChange={(value) => updateAssets({ nisa: value === null ? null : Number(value) })}
                />
                <NumberField
                  label="iDeCo（万円）"
                  value={assets.ideco ?? 0}
                  min={0}
                  width={200}
                  onValueChange={(value) => updateAssets({ ideco: value === null ? null : Number(value) })}
                />
                <NumberField
                  label="その他投資（万円）"
                  value={assets.otherInvestments ?? 0}
                  min={0}
                  width={200}
                  onValueChange={(value) => updateAssets({ otherInvestments: value === null ? null : Number(value) })}
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
