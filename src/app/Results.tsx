import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  LineChart,
  ChartsContainer,
  BarPlot,
  LinePlot,
  MarkPlot,
  ChartsXAxis,
  ChartsYAxis,
  ChartsTooltip,
  ChartsLegend,
  ChartsAxisHighlight
} from '@mui/x-charts'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Navi from '@/components/common/Navi'
import React from 'react'
import { useHomeStore } from '@/store/useHomeStore'
import { useFamilyStore } from '@/store/useFamilyStore'
import { useChildStore } from '@/store/useChildStore'
import { useCarStore } from '@/store/useCarStore'
import { useLivingStore } from '@/store/useLivingStore'
import { useIncomeStore } from '@/store/useIncomeStore'
import { useOtherStore } from '@/store/useOtherStore'
import { useRetirementStore } from '@/store/useRetirementStore'
import { useScenarioStore } from '@/store/useScenarioStore'
import { formatCurrency, formatMan } from '@/utils/format'
import { buildSimulationData } from '@/utils/simulation'
import { buildScenarioSimulationData } from '@/utils/scenarioHelper'
import Divider from '@mui/material/Divider'

const COLORS = {
  rentalBase: '#e63636ff',
  rentalRenewal: '#fb5607',
  ownSingle: '#2a9d8f',
  ownMain: '#e63636ff',
  ownPartner: '#ffcb49ff',
  homeMaintenance: '#af61f4ff',
  childExpense: '#51e7e7ff',
  carExpense: '#f174d8ff',
  livingExpense: '#38b000',
  otherExpense: '#3a3a39ff',
  income: '#c8c67aff',
  balance: '#2179bcff'
}

export default function Results() {
  const { plans: homePlans } = useHomeStore()
  const { people } = useFamilyStore()
  const { plans: childPlans } = useChildStore()
  const { cars: carPlans } = useCarStore()
  const { plan: livingPlan } = useLivingStore()
  const { expenses: otherExpenses } = useOtherStore()
  const { main, partner, assets, passiveIncome } = useIncomeStore()
  const retirementData = useRetirementStore()
  const { scenarios, saveScenario, updateScenario, loadScenario, deleteScenario } = useScenarioStore()
  const [scenarioName, setScenarioName] = React.useState('')

  const myself = React.useMemo(() => Array.from(people.values()).find((p) => p.relationship === 'myself'), [people])
  const spouse = React.useMemo(() => Array.from(people.values()).find((p) => p.relationship === 'spouse'), [people])
  const ownMainLabel = myself?.name ? `ペアローン(主: ${myself.name})` : 'ペアローン(主)'
  const ownPartnerLabel = spouse?.name ? `ペアローン(副: ${spouse.name})` : 'ペアローン(副)'

  const dataset = React.useMemo(
    () =>
      buildSimulationData(
        homePlans,
        people,
        childPlans,
        carPlans,
        livingPlan,
        otherExpenses,
        {
          main,
          partner,
          assets,
          passiveIncome
        },
        retirementData
      ),
    [
      homePlans,
      people,
      childPlans,
      carPlans,
      livingPlan,
      otherExpenses,
      main,
      partner,
      assets,
      passiveIncome,
      retirementData
    ]
  )

  const compareDataset = React.useMemo(() => {
    if (scenarios.length === 0) return []

    // 各シナリオのデータを1回だけ計算
    const scenarioDatasets: Record<string, ReturnType<typeof buildScenarioSimulationData>> = {}
    scenarios.forEach((s) => {
      scenarioDatasets[s.id] = buildScenarioSimulationData(s)
    })

    let minYear = dataset[0]?.year ?? new Date().getFullYear()
    let maxYear = dataset[dataset.length - 1]?.year ?? minYear

    Object.values(scenarioDatasets).forEach((sd) => {
      if (sd.length > 0) {
        if (sd[0].year < minYear) minYear = sd[0].year
        if (sd[sd.length - 1].year > maxYear) maxYear = sd[sd.length - 1].year
      }
    })

    const unified = []
    for (let year = minYear; year <= maxYear; year++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row: any = { year }
      const currentSd = dataset.find((x) => x.year === year)
      row.current = currentSd ? currentSd.balance : null

      scenarios.forEach((s) => {
        const sd = scenarioDatasets[s.id]?.find((x) => x.year === year)
        row[`scenario_${s.id}`] = sd ? sd.balance : null
      })
      unified.push(row)
    }
    return unified
  }, [dataset, scenarios])

  const finalBalance = dataset[dataset.length - 1]?.balance ?? 0
  const peakExpense = Math.max(...dataset.map((d) => d.total))
  const peakYear = dataset.find((d) => d.total === peakExpense)?.year

  const totalIncome = (main.annualSalary ?? 0) + (partner.annualSalary ?? 0) + (passiveIncome ?? 0)
  const netIncome = Math.floor(totalIncome * 0.75)

  // グラフの幅をデータ数（年度数）に応じて計算
  const chartWidth = Math.max(800, dataset.length * 40)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Navi />
      <Box sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, md: 4 } }}>
        <Typography variant="h4" sx={{ marginBottom: '8px', fontWeight: 'bold' }}>
          シミュレーション結果
        </Typography>
        <Typography color="text.secondary" sx={{ marginBottom: 4 }}>
          将来の家計収支と資産残高の推移を確認しましょう。
        </Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ marginBottom: 4 }}>
          <Card sx={{ flex: 1, bgcolor: finalBalance >= 0 ? 'primary.light' : 'error.light', color: 'white' }}>
            <CardContent>
              <Typography variant="overline">90歳時点の資産残高</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(Math.floor(finalBalance))} 万円
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="overline">最大支出（年額）</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatMan(peakExpense)} 万円
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {peakYear}年ごろ
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="overline">世帯年間合計収入（額面）</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(totalIncome)} 万円
              </Typography>
              <Typography variant="body2" color="text.secondary">
                手取り額（推定）: {formatCurrency(netIncome)} 万円
              </Typography>
            </CardContent>
          </Card>
        </Stack>

        <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            {dataset.length === 0 ? (
              <Typography color="text.secondary">データを入力するとシミュレーション結果が表示されます。</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                    シミュレーション結果（資産推移・収支統合）
                  </Typography>
                  <Box sx={{ width: '100%', overflowX: 'auto' }}>
                    <Box sx={{ minWidth: chartWidth, height: 600 }}>
                      <ChartsContainer
                        dataset={dataset}
                        height={600}
                        margin={{ top: 80, right: 80, bottom: 60, left: 80 }}
                        xAxis={[
                          {
                            dataKey: 'year',
                            scaleType: 'band',
                            id: 'x-axis',
                            valueFormatter: (year: number) => {
                              const datum = dataset.find((d) => d.year === year)
                              if (datum && datum.memberAges.length > 0) {
                                const ages = datum.memberAges.map((ma) => `${ma.name}: ${ma.age}歳`).join(' / ')
                                return `${year}年\n(${ages})`
                              }
                              return `${year}年`
                            }
                          }
                        ]}
                        yAxis={[
                          {
                            id: 'flow-axis',
                            label: '収支 (万円)',
                            position: 'left',
                            valueFormatter: (v: number) => `${(v / 10000).toLocaleString()}万`
                          },
                          {
                            id: 'stock-axis',
                            label: '資産残高 (万円)',
                            position: 'right',
                            valueFormatter: (v: number) => `${(v / 10000).toLocaleString()}万`
                          }
                        ]}
                        series={[
                          {
                            type: 'bar',
                            dataKey: 'income',
                            label: '収入(手取り)',
                            color: COLORS.income,
                            yAxisId: 'flow-axis'
                          },
                          {
                            type: 'bar',
                            dataKey: 'rentalBase',
                            label: '家賃',
                            stack: 'expense',
                            color: COLORS.rentalBase,
                            yAxisId: 'flow-axis'
                          },
                          {
                            type: 'bar',
                            dataKey: 'rentalRenewal',
                            label: '更新料',
                            stack: 'expense',
                            color: COLORS.rentalRenewal,
                            yAxisId: 'flow-axis'
                          },
                          {
                            type: 'bar',
                            dataKey: 'ownSingle',
                            label: '住宅ローン',
                            stack: 'expense',
                            color: COLORS.ownSingle,
                            yAxisId: 'flow-axis'
                          },
                          {
                            type: 'bar',
                            dataKey: 'ownMain',
                            label: ownMainLabel,
                            stack: 'expense',
                            color: COLORS.ownMain,
                            yAxisId: 'flow-axis'
                          },
                          {
                            type: 'bar',
                            dataKey: 'ownPartner',
                            label: ownPartnerLabel,
                            stack: 'expense',
                            color: COLORS.ownPartner,
                            yAxisId: 'flow-axis'
                          },
                          {
                            type: 'bar',
                            dataKey: 'homeMaintenance',
                            label: '住宅維持費',
                            stack: 'expense',
                            color: COLORS.homeMaintenance,
                            yAxisId: 'flow-axis'
                          },
                          {
                            type: 'bar',
                            dataKey: 'childExpense',
                            label: '子教育費',
                            stack: 'expense',
                            color: COLORS.childExpense,
                            yAxisId: 'flow-axis'
                          },
                          {
                            type: 'bar',
                            dataKey: 'carExpense',
                            label: '車両費',
                            stack: 'expense',
                            color: COLORS.carExpense,
                            yAxisId: 'flow-axis'
                          },
                          {
                            type: 'bar',
                            dataKey: 'livingExpense',
                            label: '生活費',
                            stack: 'expense',
                            color: COLORS.livingExpense,
                            yAxisId: 'flow-axis'
                          },
                          {
                            type: 'bar',
                            dataKey: 'otherExpense',
                            label: 'その他',
                            stack: 'expense',
                            color: COLORS.otherExpense,
                            yAxisId: 'flow-axis'
                          },
                          {
                            type: 'line',
                            dataKey: 'balance',
                            label: '資産残高',
                            color: COLORS.balance,
                            yAxisId: 'stock-axis',
                            showMark: false
                          }
                        ]}
                      >
                        <BarPlot />
                        <LinePlot />
                        <MarkPlot />
                        <ChartsXAxis axisId="x-axis" />
                        <ChartsYAxis axisId="flow-axis" />
                        <ChartsYAxis axisId="stock-axis" />
                        <ChartsTooltip />
                        <ChartsLegend direction="horizontal" />
                        <ChartsAxisHighlight x="band" />
                      </ChartsContainer>
                    </Box>
                  </Box>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                    資産残高 詳細 (単位: 万円)
                  </Typography>
                  <Box sx={{ overflowX: 'auto', display: 'flex', gap: 3, pb: 2 }}>
                    {Array.from({ length: Math.ceil(dataset.length / 10) }).map((_, i) => {
                      const chunk = dataset.slice(i * 10, i * 10 + 10)
                      const initialAssets =
                        (assets.bankSavings ?? 0) +
                        (assets.nisa ?? 0) +
                        (assets.ideco ?? 0) +
                        (assets.otherInvestments ?? 0)

                      return (
                        <TableContainer
                          key={i}
                          component={Paper}
                          variant="outlined"
                          sx={{ minWidth: 220, maxWidth: 280, borderRadius: 2 }}
                        >
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>年</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                  残高
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                  前年比
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {chunk.map((d, indexInChunk) => {
                                const absoluteIndex = i * 10 + indexInChunk
                                const prevBalance =
                                  absoluteIndex > 0 ? dataset[absoluteIndex - 1].balance : initialAssets
                                const diff = Math.floor(d.balance - prevBalance)

                                return (
                                  <TableRow key={d.year} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem', p: 0.5 }}>
                                      {d.year}年
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'medium', p: 0.5 }}>
                                      {Math.floor(d.balance).toLocaleString()}
                                    </TableCell>
                                    <TableCell
                                      align="right"
                                      sx={{
                                        p: 0.5,
                                        fontSize: '0.8rem',
                                        color: diff >= 0 ? 'success.main' : 'error.main'
                                      }}
                                    >
                                      {diff > 0 ? `+${diff.toLocaleString()}` : diff.toLocaleString()}
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )
                    })}
                  </Box>
                </Box>

                <Divider />

                <Box id="scenario-management">
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    プランの保存・シミュレーション比較
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    現在の入力内容を名前をつけて保存したり、過去のプランと資産残高を比較できます。
                  </Typography>

                  <Box sx={{ mb: 6 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <TextField
                        size="small"
                        label="プラン名 (例: 郊外で持ち家プラン)"
                        value={scenarioName}
                        onChange={(e) => setScenarioName(e.target.value)}
                        sx={{ width: 300 }}
                      />
                      <Button
                        variant="contained"
                        disabled={!scenarioName.trim()}
                        onClick={() => {
                          saveScenario(scenarioName.trim())
                          setScenarioName('')
                        }}
                      >
                        現在の入力を保存
                      </Button>
                    </Box>
                  </Box>

                  {scenarios.length > 0 && (
                    <>
                      <Box sx={{ mb: 6 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                          保存済みのプランと資産残高の比較
                        </Typography>
                        <Box sx={{ width: '100%', overflowX: 'auto' }}>
                          <Box sx={{ minWidth: 800 }}>
                            <LineChart
                              dataset={compareDataset}
                              height={400}
                              margin={{ top: 80, right: 20, bottom: 40, left: 80 }}
                              xAxis={[
                                {
                                  dataKey: 'year',
                                  valueFormatter: (v: number) => `${v}年`
                                }
                              ]}
                              yAxis={[
                                {
                                  label: '資産残高 (万円)',
                                  valueFormatter: (v: number) => `${v.toLocaleString()}万`
                                }
                              ]}
                              series={[
                                {
                                  dataKey: 'current',
                                  label: '現在の状態',
                                  color: COLORS.balance,
                                  showMark: false,
                                  connectNulls: true
                                },
                                ...scenarios.map((s, idx) => ({
                                  dataKey: `scenario_${s.id}`,
                                  label: s.name,
                                  showMark: false,
                                  connectNulls: true,
                                  color: `hsl(${(idx * 137) % 360}, 70%, 50%)`
                                }))
                              ]}
                              slotProps={{
                                legend: {
                                  direction: 'horizontal',
                                  position: { vertical: 'top', horizontal: 'center' }
                                }
                              }}
                            />
                          </Box>
                        </Box>
                      </Box>

                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                          プラン管理
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>プラン名</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>保存日時</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                  操作
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {scenarios.map((s) => (
                                <TableRow key={s.id}>
                                  <TableCell>{s.name}</TableCell>
                                  <TableCell>{new Date(s.createdAt).toLocaleString()}</TableCell>
                                  <TableCell align="right">
                                    <Button
                                      size="small"
                                      onClick={() => {
                                        if (window.confirm(`${s.name} を読み込みますか？`)) {
                                          loadScenario(s.id)
                                        }
                                      }}
                                    >
                                      読み込む
                                    </Button>
                                    <Button
                                      size="small"
                                      color="warning"
                                      onClick={() => {
                                        if (window.confirm(`${s.name} を現在ので上書きしますか？`)) {
                                          updateScenario(s.id)
                                        }
                                      }}
                                    >
                                      上書き
                                    </Button>
                                    <Button
                                      size="small"
                                      color="error"
                                      onClick={() => {
                                        if (window.confirm(`${s.name} を削除しますか？`)) {
                                          deleteScenario(s.id)
                                        }
                                      }}
                                    >
                                      削除
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </>
                  )}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
