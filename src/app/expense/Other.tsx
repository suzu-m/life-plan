import Navi from '@/components/common/Navi'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

export default function ExpenseOther() {
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
          支出：その他
        </Typography>
        <Typography color="text.secondary" sx={{ marginBottom: 3 }}>
          その他の特別な支出項目があれば入力してください。（現在は準備中）
        </Typography>

        <Button variant="contained" href="/income">
          次へ（収入の入力へ）
        </Button>
      </Box>
    </Box>
  )
}
