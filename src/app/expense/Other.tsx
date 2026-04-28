import Navi from '@/components/common/Navi'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import NumberField from '@/components/common/NumberField'
import { useOtherStore } from '@/store/useOtherStore'

/**
 * 支出：その他の項目を入力する画面
 */
export default function ExpenseOther() {
  const { expenses, draft, editingId, updateDraft, saveDraft, editExpense, deleteExpense, resetDraft } = useOtherStore()

  const currentYear = new Date().getFullYear()
  const sortedExpenses = Array.from(expenses.values()).sort((a, b) => (a.startYear ?? 0) - (b.startYear ?? 0))

  return (
    <Box sx={{ width: '100%', display: 'flex' }}>
      <Navi />
      <Box sx={{ width: '100%', padding: '40px 20px', margin: '0 auto' }}>
        <Typography variant="h4" sx={{ marginBottom: '8px', fontWeight: 'bold' }}>
          支出：その他
        </Typography>
        <Typography color="text.secondary" sx={{ marginBottom: 3 }}>
          冠婚葬祭や数年おきの大型出費など、特別な支出を登録できます。
        </Typography>

        <Card sx={{ marginBottom: 4, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              {editingId !== null ? '項目を編集' : '新しい項目を追加'}
            </Typography>
            <Stack spacing={3}>
              <TextField
                label="項目名（例：冠婚葬祭、家電買い替え）"
                fullWidth
                variant="outlined"
                value={draft.title}
                onChange={(e) => updateDraft({ title: e.target.value })}
              />
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <NumberField
                  label="金額（万円）"
                  width="100%"
                  value={draft.amount}
                  onValueChange={(value) => updateDraft({ amount: value })}
                />
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', width: '100%' }}>
                  <NumberField
                    label="開始年"
                    width="100%"
                    value={draft.startYear ?? currentYear}
                    onValueChange={(value) => updateDraft({ startYear: value })}
                  />
                  <Typography>〜</Typography>
                  <NumberField
                    label="終了年"
                    width="100%"
                    value={draft.endYear}
                    min={draft.startYear ?? currentYear}
                    onValueChange={(value) => updateDraft({ endYear: value })}
                  />
                </Box>
                <NumberField
                  label="頻度（年おき）"
                  width="100%"
                  value={draft.frequency}
                  onValueChange={(value) => updateDraft({ frequency: value })}
                />
              </Box>
              <Stack>
                <Typography variant="caption">
                  ※単発の支出（1回だけ）の場合は、開始年と終了年を同じ年にしてください。
                </Typography>
                <Typography variant="caption">※終了年を空欄にすると、以降ずっと支出が発生します。</Typography>
                <Typography variant="caption">※頻度は毎年なら 1、2年に1回なら 2、単発なら 0</Typography>
              </Stack>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={resetDraft}>
                  リセット
                </Button>
                <Button variant="contained" onClick={saveDraft} disabled={!draft.title || !draft.amount} sx={{ px: 4 }}>
                  {editingId !== null ? '更新する' : '追加する'}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          登録済みの項目
        </Typography>
        <Stack spacing={2}>
          {sortedExpenses.length === 0 ? (
            <Card variant="outlined" sx={{ borderRadius: 2, p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">登録された項目はありません。</Typography>
            </Card>
          ) : (
            sortedExpenses.map((expense) => (
              <Card
                key={expense.id}
                variant="outlined"
                sx={{ borderRadius: 2, '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' } }}
              >
                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {expense.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {expense.endYear === null ? (
                        <>{expense.startYear}年 〜 (以降ずっと)</>
                      ) : expense.startYear === expense.endYear ? (
                        <>{expense.startYear}年</>
                      ) : (
                        <>
                          {expense.startYear}年 〜 {expense.endYear}年
                        </>
                      )}{' '}
                      / {expense.amount?.toLocaleString()}万円
                      {expense.frequency && expense.frequency > 1 ? `（${expense.frequency}年おき）` : ''}
                      {expense.frequency === 1 && (expense.startYear !== expense.endYear || expense.endYear === null)
                        ? '（毎年）'
                        : ''}
                      {(expense.frequency === 0 || !expense.frequency) && expense.startYear === expense.endYear
                        ? '（単発）'
                        : ''}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton onClick={() => editExpense(expense.id)} color="primary" size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => deleteExpense(expense.id)} color="error" size="small" sx={{ ml: 1 }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>

        <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" color="primary" size="large" href="/results" sx={{ px: 6 }}>
            シミュレーション結果を見る
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
