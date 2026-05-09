import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

export type HintType = 'earlyEducation' | 'elementarySchool' | 'juniorHighSchool' | 'highSchool' | 'higherEducation'

export const HintDialog = (props: { open: boolean; onClose: () => void; type: HintType }) => {
  const { onClose, open, type } = props

  const renderContent = () => {
    switch (type) {
      case 'earlyEducation':
        return (
          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              幼稚園の学習費（年間平均）
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell></TableCell>
                    <TableCell align="right">公立</TableCell>
                    <TableCell align="right">私立</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>年間平均</TableCell>
                    <TableCell align="right">16.5万円</TableCell>
                    <TableCell align="right">30.9万円</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>3年間合計</TableCell>
                    <TableCell align="right">47.3万円</TableCell>
                    <TableCell align="right">92.5万円</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Typography variant="body2" color="text.secondary">
              私立幼稚園の学習費総額は公立の約1.9倍です。公立・私立ともに「学校外活動費」の割合が高くなっています。
              <br />
              ※出典：文部科学省「令和3年度子供の学習費調査」
            </Typography>
          </Stack>
        )
      case 'elementarySchool':
        return (
          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              小学校の学習費（年間平均）
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell></TableCell>
                    <TableCell align="right">公立</TableCell>
                    <TableCell align="right">私立</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>年間平均</TableCell>
                    <TableCell align="right">35.3万円</TableCell>
                    <TableCell align="right">166.7万円</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>6年間合計</TableCell>
                    <TableCell align="right">211.2万円</TableCell>
                    <TableCell align="right">1,000.0万円</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Typography variant="body2" color="text.secondary">
              私立小学校は公立の約4.7倍の費用がかかります。公立では学校外活動費が7割を占める一方、私立は学校教育費が約6割を占めます。
              <br />
              ※出典：文部科学省「令和3年度子供の学習費調査」
            </Typography>
          </Stack>
        )
      case 'juniorHighSchool':
        return (
          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              中学校の学習費（年間平均）
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell></TableCell>
                    <TableCell align="right">公立</TableCell>
                    <TableCell align="right">私立</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>年間平均</TableCell>
                    <TableCell align="right">53.9万円</TableCell>
                    <TableCell align="right">143.6万円</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>3年間合計</TableCell>
                    <TableCell align="right">161.6万円</TableCell>
                    <TableCell align="right">430.4万円</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Typography variant="body2" color="text.secondary">
              私立中学校は公立の約2.7倍です。公立では塾などの学校外活動費が約7割、私立は学費等の学校教育費が約7割を占めるのが特徴です。
              <br />
              ※出典：文部科学省「令和3年度子供の学習費調査」
            </Typography>
          </Stack>
        )
      case 'highSchool':
        return (
          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              高校の学習費（年間平均）
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell></TableCell>
                    <TableCell align="right">公立</TableCell>
                    <TableCell align="right">私立</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>年間平均</TableCell>
                    <TableCell align="right">51.3万円</TableCell>
                    <TableCell align="right">105.4万円</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>3年間合計</TableCell>
                    <TableCell align="right">154.3万円</TableCell>
                    <TableCell align="right">315.6万円</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Typography variant="body2" color="text.secondary">
              私立高校は公立の約2.1倍です。中学校と比較して総額が下がる傾向にありますが、これは主に給食費がかからなくなるためです。
              <br />
              ※出典：文部科学省「令和3年度子供の学習費調査」
            </Typography>
          </Stack>
        )
      case 'higherEducation':
        return (
          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              大学の学習費（4年間合計）
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell></TableCell>
                    <TableCell align="right">国公立</TableCell>
                    <TableCell align="right">私立文系</TableCell>
                    <TableCell align="right">私立理系</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>入学費用</TableCell>
                    <TableCell align="right">67万円</TableCell>
                    <TableCell align="right">82万円</TableCell>
                    <TableCell align="right">89万円</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>年間在学費</TableCell>
                    <TableCell align="right">104万円</TableCell>
                    <TableCell align="right">152万円</TableCell>
                    <TableCell align="right">183万円</TableCell>
                  </TableRow>
                  <TableRow sx={{ bgcolor: 'action.selected' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>4年合計</TableCell>
                    <TableCell align="right">481万円</TableCell>
                    <TableCell align="right">690万円</TableCell>
                    <TableCell align="right">822万円</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Divider />
            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold' }}>
              医学部・歯学部（6年間）
            </Typography>
            <Typography variant="body2">
              ・国公立：約350万円
              <br />
              ・私立：3,000万〜5,000万円超
            </Typography>
            <Typography variant="body2" color="text.secondary">
              私立大学理系が最も高額で、医学部・歯学部はさらに桁違いの費用がかかります。計画的な準備が推奨されます。
              <br />
              ※出典：日本政策金融公庫「令和3年度教育費負担の実態調査」ほか
            </Typography>
          </Stack>
        )
      default:
        return null
    }
  }

  return (
    <Dialog onClose={onClose} open={open} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', mb: 1 }}>費用の目安</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 1 }}>{renderContent()}</Box>
      </DialogContent>
    </Dialog>
  )
}
