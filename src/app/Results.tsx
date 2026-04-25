import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { BarChart } from '@mui/x-charts/BarChart'
import { LineChart } from '@mui/x-charts/LineChart'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
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
import { formatCurrency, formatMan } from '@/utils/format'
import { buildSimulationData } from '@/utils/simulation'

const COLORS = {
  rentalBase: '#3a86ff',
  rentalRenewal: '#fb5607',
  ownSingle: '#2a9d8f',
  ownMain: '#e63636ff',
  ownPartner: '#ffcb49ff',
  homeMaintenance: '#af61f4ff',
  childExpense: '#51e7e7ff',
  carExpense: '#f174d8ff',
  livingExpense: '#38b000',
  otherExpense: '#3a3a39ff',
  income: '#38b000',
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

  const [tabValue, setTabValue] = React.useState(0)
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

  const finalBalance = dataset[dataset.length - 1]?.balance ?? 0
  const peakExpense = Math.max(...dataset.map((d) => d.total))
  const peakYear = dataset.find((d) => d.total === peakExpense)?.year

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
        </Stack>

        <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
              <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="scrollable" scrollButtons="auto">
                <Tab label="資産残高推移" />
                <Tab label="収支比較" />
                <Tab label="支出の内訳" />
              </Tabs>
            </Box>

            <Box sx={{ p: 3 }}>
              {dataset.length === 0 ? (
                <Typography color="text.secondary">データを入力するとシミュレーション結果が表示されます。</Typography>
              ) : (
                <>
                  {tabValue === 0 && (
                    <>
                      <Box sx={{ width: '100%', overflowX: 'auto' }}>
                        <Box sx={{ minWidth: Math.max(800, dataset.length * 10) }}>
                          <LineChart
                            dataset={dataset}
                            height={550}
                            margin={{ top: 40, right: 20, bottom: 100, left: 100 }}
                            xAxis={[
                              {
                                dataKey: 'year',
                                valueFormatter: (v: number) => `${v}年`
                              }
                            ]}
                            yAxis={[
                              { label: '資産残高 (万円)', valueFormatter: (v: number) => `${v.toLocaleString()}万` }
                            ]}
                            series={[
                              {
                                dataKey: 'balance',
                                label: '資産残高',
                                color: COLORS.balance,
                                showMark: false,
                                area: true
                              }
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

                      <Box sx={{ mt: 5 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                          資産残高 詳細 (単位: 万円)
                        </Typography>
                        <Box sx={{ overflowX: 'auto', display: 'flex', gap: 3, pb: 2 }}>
                          {Array.from({ length: Math.ceil(dataset.length / 10) }).map((_, i) => {
                            const chunk = dataset.slice(i * 10, i * 10 + 10)
                            return (
                              <TableContainer
                                key={i}
                                component={Paper}
                                variant="outlined"
                                sx={{ minWidth: 180, maxWidth: 220, borderRadius: 2 }}
                              >
                                <Table size="small">
                                  <TableHead>
                                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                                      <TableCell sx={{ fontWeight: 'bold' }}>年</TableCell>
                                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                        残高
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {chunk.map((d) => (
                                      <TableRow key={d.year} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                                          {d.year}年
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'medium' }}>
                                          {Math.floor(d.balance).toLocaleString()}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            )
                          })}
                        </Box>
                      </Box>
                    </>
                  )}
                  {tabValue === 1 && (
                    <Box sx={{ width: '100%', overflowX: 'auto' }}>
                      <Box sx={{ minWidth: chartWidth }}>
                        <BarChart
                          dataset={dataset}
                          height={550}
                          margin={{ top: 40, right: 20, bottom: 100, left: 100 }}
                          xAxis={[
                            {
                              dataKey: 'year',
                              scaleType: 'band',
                              valueFormatter: (v: number) => `${v}年`
                            }
                          ]}
                          yAxis={[{ label: '収支 (万円)', valueFormatter: (v: number) => `${v.toLocaleString()}万` }]}
                          series={[
                            { dataKey: 'income', label: '収入', color: COLORS.income },
                            { dataKey: 'total', label: '支出', color: COLORS.rentalRenewal }
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
                  )}
                  {tabValue === 2 && (
                    <Box sx={{ width: '100%', overflowX: 'auto' }}>
                      <Box sx={{ minWidth: chartWidth }}>
                        <BarChart
                          dataset={dataset}
                          height={550}
                          margin={{ top: 40, right: 20, bottom: 100, left: 100 }}
                          xAxis={[
                            {
                              dataKey: 'year',
                              scaleType: 'band',
                              valueFormatter: (v: number) => `${v}年`
                            }
                          ]}
                          yAxis={[{ label: '支出 (万円)', valueFormatter: (v: number) => `${v.toLocaleString()}万` }]}
                          series={[
                            { dataKey: 'rentalBase', label: '家賃', stack: 'a', color: COLORS.rentalBase },
                            { dataKey: 'rentalRenewal', label: '更新料', stack: 'a', color: COLORS.rentalRenewal },
                            { dataKey: 'ownSingle', label: '住宅ローン', stack: 'a', color: COLORS.ownSingle },
                            { dataKey: 'ownMain', label: 'ペアローン(主)', stack: 'a', color: COLORS.ownMain },
                            { dataKey: 'ownPartner', label: 'ペアローン(副)', stack: 'a', color: COLORS.ownPartner },
                            { dataKey: 'homeMaintenance', label: '維持費', stack: 'a', color: COLORS.homeMaintenance },
                            { dataKey: 'childExpense', label: '子教育費', stack: 'a', color: COLORS.childExpense },
                            { dataKey: 'carExpense', label: '車両費', stack: 'a', color: COLORS.carExpense },
                            { dataKey: 'livingExpense', label: '生活費', stack: 'a', color: COLORS.livingExpense },
                            { dataKey: 'otherExpense', label: 'その他', stack: 'a', color: COLORS.otherExpense }
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
                  )}
                </>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
