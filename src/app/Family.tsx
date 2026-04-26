import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { type SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import Navi from '@/components/common/Navi'
import NumberField from '@/components/common/NumberField'
import { useFamilyStore } from '@/store/useFamilyStore'

function formatRelationship(relationship: string) {
  switch (relationship) {
    case 'myself':
      return '本人'
    case 'spouse':
      return '配偶者・パートナー'
    case 'child':
      return '子供'
    case 'pet':
      return 'ペット'
    default:
      return '-'
  }
}

function canUseFutureAge(relationship: string) {
  return relationship === 'child' || relationship === 'pet'
}

function formatAge(age: number | null, relationship: string) {
  if (age === null) {
    return '-'
  }

  if (age < 0 && canUseFutureAge(relationship)) {
    return relationship === 'child' ? `${Math.abs(age)}年後に生まれる想定` : `${Math.abs(age)}年後に迎える想定`
  }

  return `${age}歳`
}

export default function Family() {
  const { people, draft, editingPersonId, updateDraft, saveDraftPerson, editPerson, deletePerson, resetDraft } =
    useFamilyStore()

  const sortedPeople = [...people.entries()].sort(([a], [b]) => a - b)
  const isDraftValid = draft.name.trim() !== '' && draft.relationship !== ''
  const allowFutureAge = canUseFutureAge(draft.relationship)

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
        <Typography color="text.secondary" sx={{ marginBottom: 3 }}>
          入力内容を確定して一覧化できます。あとから編集や削除もできます。
        </Typography>
        {editingPersonId !== null && (
          <Typography color="primary" sx={{ marginBottom: 2 }}>
            編集モードです。内容を変更して「この内容で更新」を押してください。
          </Typography>
        )}

        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                {/* 住宅費画面と同じく、上段フォームで入力して一覧へ確定する流れにそろえる。 */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Box sx={{ minWidth: 220 }}>
                    <FormControl fullWidth>
                      <InputLabel id="relationship-label">続柄</InputLabel>
                      <Select
                        labelId="relationship-label"
                        id="relationship"
                        value={draft.relationship}
                        label="続柄"
                        onChange={(e: SelectChangeEvent) =>
                          updateDraft({
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
                    value={draft.name}
                    onChange={(e) => {
                      updateDraft({
                        name: e.target.value
                      })
                    }}
                  />

                  <NumberField
                    label="年齢"
                    value={draft.age ?? 0}
                    min={allowFutureAge ? undefined : 0}
                    helperText={allowFutureAge ? 'マイナスなら未来に生まれる・迎える想定として扱います。' : undefined}
                    onValueChange={(value) => {
                      updateDraft({
                        age: value === null ? null : allowFutureAge ? Number(value) : Math.max(0, Number(value))
                      })
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button variant="text" onClick={resetDraft}>
                    {editingPersonId !== null ? '編集をキャンセル' : '入力をリセット'}
                  </Button>
                  <Button variant="contained" onClick={saveDraftPerson} disabled={!isDraftValid}>
                    {editingPersonId !== null ? 'この内容で更新' : 'この内容で追加'}
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
            {sortedPeople.map(([personId, person]) => (
              <Box>
                <Card key={personId} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                      <Box>
                        <Typography>{formatRelationship(person.relationship)}</Typography>
                        <Typography>{person.name || '-'}</Typography>
                        <Typography>{formatAge(person.age, person.relationship)}</Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton aria-label="edit" onClick={() => editPerson(personId)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton aria-label="delete" onClick={() => deletePerson(personId)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Stack>

        <Button variant="contained" sx={{ marginTop: 2 }} href="/expense/home">
          支出＞住宅の入力へ
        </Button>
      </Box>
    </Box>
  )
}
