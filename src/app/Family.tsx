import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select, { type SelectChangeEvent } from '@mui/material/Select'
import NumberField from '@/components/common/NumberField'
import { useFamilyStore } from '@/store/useFamilyStore'
import DeleteIcon from '@mui/icons-material/Delete'
import Navi from '@/components/common/Navi'

export default function Family() {
  const { inputValue, updatePerson, createPerson, deletePerson } = useFamilyStore()
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
          家族構成
        </Typography>
        <Stack spacing={2}>
          {[...inputValue.entries()].map(([key, person]) => (
            <Card key={key} variant="outlined" sx={{ position: 'relative' }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2
                    }}
                  >
                    <Box sx={{ minWidth: 220 }}>
                      <FormControl fullWidth>
                        <InputLabel id="relationship-label">続柄</InputLabel>
                        <Select
                          labelId="relationship-label"
                          id="relationship"
                          value={person.relationship}
                          label="続柄"
                          onChange={(e: SelectChangeEvent) =>
                            updatePerson(key, {
                              ...person,
                              relationship: e.target.value
                            })
                          }
                        >
                          <MenuItem value="myself">本人</MenuItem>
                          <MenuItem value="spouse">配偶者・パートナー</MenuItem>
                          <MenuItem value="child">子供</MenuItem>
                          <MenuItem value="pet">ペット</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <TextField
                      required
                      id="name"
                      label="名前"
                      value={person.name}
                      onChange={(e) => {
                        updatePerson(key, {
                          ...person,
                          name: e.target.value
                        })
                      }}
                    />
                    <Box>
                      <NumberField
                        label="年齢"
                        value={person.age ?? 0}
                        onValueChange={(value) => {
                          updatePerson(key, {
                            ...person,
                            age: value ? Number(value) : null
                          })
                        }}
                      />
                    </Box>
                  </Box>
                  <Box>
                    <IconButton aria-label="delete" onClick={() => deletePerson(key)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
          <Button variant="outlined" onClick={() => createPerson()}>
            + 追加
          </Button>
        </Box>
        <Button variant="contained" sx={{ marginTop: 2 }} href="/expense/home">
          支出＞住宅の入力へ
        </Button>
      </Box>
    </Box>
  )
}
