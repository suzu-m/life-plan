import Navi from '@/components/common/Navi'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

export default function Home() {
  return (
    <Box sx={{ width: '100%', display: 'flex' }}>
      <Navi />
      <Box
        sx={{
          width: '100%',
          padding: '40px 20px',
          margin: '0 auto',
          textAlign: 'center'
        }}
      >
        <Typography variant="h4" sx={{ marginBottom: '8px' }}>
          LIFE SIMULATION
        </Typography>
        <Typography color="text.secondary" sx={{ marginBottom: 4 }}>
          将来の家計収支と資産残高の推移を確認しましょう。
        </Typography>
        <Box>
          <img src="/img_top.jpeg" alt="top" style={{ width: '100%', maxWidth: '800px' }} />
        </Box>
        <Box>
          <Button variant="contained" size="large" sx={{ width: '300px' }} href="/family">
            早速はじめる
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
