import Navi from '@/components/common/Navi'
import Box from '@mui/material/Box'
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
      </Box>
    </Box>
  )
}
