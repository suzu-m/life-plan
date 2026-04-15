import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Select, { type SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import DeleteIcon from '@mui/icons-material/Delete'
import Navi from '@/components/common/Navi'
import NumberField from '@/components/common/NumberField'
import { useFamilyStore } from '@/store/useFamilyStore'
import {
  useChildStore,
  type ChildExpensePlan,
  type EarlyEducationType,
  type SchoolType
} from '@/store/useChildStore'

const SCHOOL_OPTIONS: Array<{ value: SchoolType; label: string }> = [
  { value: 'public', label: '公立' },
  { value: 'private', label: '私立' }
]

function createDefaultPlan(): ChildExpensePlan {
  return {
    earlyEducationType: 'none',
    earlyEducationStartAge: null,
    elementarySchoolType: 'public',
    juniorHighSchoolType: 'public',
    highSchoolType: 'public',
    higherEducationType: 'none',
    universityType: '',
    universityMajorType: '',
    lifeEvents: [],
    nextLifeEventId: 0
  }
}

function formatAgeLabel(age: number | null) {
  if (age === null) {
    return '年齢未設定'
  }

  if (age < 0) {
    return `${Math.abs(age)}年後に生まれる想定`
  }

  return `${age}歳`
}

function ChildSchoolSelect({
  label,
  value,
  onChange
}: {
  label: string
  value: SchoolType
  onChange: (value: SchoolType) => void
}) {
  return (
    <FormControl sx={{ minWidth: 160 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={(e: SelectChangeEvent) => onChange(e.target.value as SchoolType)}
      >
        {SCHOOL_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

function formatEarlyEducationLabel(value: EarlyEducationType) {
  switch (value) {
    case 'nursery':
      return '保育園'
    case 'kindergarten':
      return '幼稚園'
    default:
      return '入れない'
  }
}

export default function ExpenseChild() {
  const people = useFamilyStore((state) => state.people)
  const childPeople = [...people.entries()]
    .filter(([, person]) => person.relationship === 'child')
    .sort(([a], [b]) => a - b)
  const plans = useChildStore((state) => state.plans)
  const updatePlan = useChildStore((state) => state.updatePlan)
  const updateLifeEvent = useChildStore((state) => state.updateLifeEvent)
  const addLifeEvent = useChildStore((state) => state.addLifeEvent)
  const deleteLifeEvent = useChildStore((state) => state.deleteLifeEvent)

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
          支出：子供
        </Typography>
        <Typography color="text.secondary" sx={{ marginBottom: 3 }}>
          家族構成で登録した子供ごとに、教育方針やライフイベント費用を設定できます。
        </Typography>

        {childPeople.length === 0 ? (
          <Card>
            <CardContent>
              <Typography color="text.secondary">
                家族構成で「子供」を登録すると、ここに入力カードが表示されます。
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {childPeople.map(([personId, child], index) => {
              const plan = plans.get(personId) ?? createDefaultPlan()

              return (
                <Card key={personId}>
                  <CardContent>
                    <Stack spacing={3}>
                      <Box>
                        <Typography variant="h6">
                          子供 {index + 1}: {child.name || '名前未設定'}
                        </Typography>
                        <Typography color="text.secondary">{formatAgeLabel(child.age)}</Typography>
                      </Box>

                      {/* 幼少期の進路は保育園か幼稚園のどちらかを選ぶ前提で保持する。 */}
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        <Box sx={{ minWidth: 320 }}>
                          <FormControl>
                            <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
                              保育園・幼稚園
                            </Typography>
                            <RadioGroup
                              row
                              value={plan.earlyEducationType}
                              onChange={(e) =>
                                updatePlan(personId, {
                                  earlyEducationType: e.target.value as EarlyEducationType,
                                  earlyEducationStartAge:
                                    e.target.value === 'none' ? null : plan.earlyEducationStartAge
                                })
                              }
                            >
                              <FormControlLabel value="none" control={<Radio />} label="入れない" />
                              <FormControlLabel value="nursery" control={<Radio />} label="保育園" />
                              <FormControlLabel value="kindergarten" control={<Radio />} label="幼稚園" />
                            </RadioGroup>
                          </FormControl>
                          {plan.earlyEducationType !== 'none' ? (
                            <NumberField
                              label={`${formatEarlyEducationLabel(plan.earlyEducationType)}の開始年齢`}
                              value={plan.earlyEducationStartAge ?? 0}
                              min={0}
                              onValueChange={(value) =>
                                updatePlan(personId, {
                                  earlyEducationStartAge: value === null ? null : Number(value)
                                })
                              }
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              入れる場合だけ開始年齢を設定します。
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <ChildSchoolSelect
                          label="小学校"
                          value={plan.elementarySchoolType}
                          onChange={(value) => updatePlan(personId, { elementarySchoolType: value })}
                        />
                        <ChildSchoolSelect
                          label="中学校"
                          value={plan.juniorHighSchoolType}
                          onChange={(value) => updatePlan(personId, { juniorHighSchoolType: value })}
                        />
                        <ChildSchoolSelect
                          label="高校"
                          value={plan.highSchoolType}
                          onChange={(value) => updatePlan(personId, { highSchoolType: value })}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        <FormControl sx={{ minWidth: 200 }}>
                          <InputLabel>高等教育</InputLabel>
                          <Select
                            value={plan.higherEducationType}
                            label="高等教育"
                            onChange={(e: SelectChangeEvent) =>
                              updatePlan(personId, {
                                higherEducationType: e.target.value as ChildExpensePlan['higherEducationType'],
                                universityType: e.target.value === 'university' ? plan.universityType : '',
                                universityMajorType: e.target.value === 'university' ? plan.universityMajorType : ''
                              })
                            }
                          >
                            <MenuItem value="none">進学しない</MenuItem>
                            <MenuItem value="university">大学</MenuItem>
                            <MenuItem value="juniorCollege">短大</MenuItem>
                            <MenuItem value="vocational">専門</MenuItem>
                          </Select>
                        </FormControl>

                        {plan.higherEducationType === 'university' && (
                          <>
                            <FormControl sx={{ minWidth: 180 }}>
                              <InputLabel>大学区分</InputLabel>
                              <Select
                                value={plan.universityType}
                                label="大学区分"
                                onChange={(e: SelectChangeEvent) =>
                                  updatePlan(personId, {
                                    universityType: e.target.value as ChildExpensePlan['universityType']
                                  })
                                }
                              >
                                <MenuItem value="national-public">国公立</MenuItem>
                                <MenuItem value="private">私立</MenuItem>
                              </Select>
                            </FormControl>

                            <FormControl sx={{ minWidth: 160 }}>
                              <InputLabel>文理</InputLabel>
                              <Select
                                value={plan.universityMajorType}
                                label="文理"
                                onChange={(e: SelectChangeEvent) =>
                                  updatePlan(personId, {
                                    universityMajorType: e.target.value as ChildExpensePlan['universityMajorType']
                                  })
                                }
                              >
                                <MenuItem value="liberalArts">文系</MenuItem>
                                <MenuItem value="science">理系</MenuItem>
                                <MenuItem value="medical">医薬</MenuItem>
                              </Select>
                            </FormControl>
                          </>
                        )}
                      </Box>

                      <Box>
                        <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
                          ライフイベント費用
                        </Typography>
                        <Typography color="text.secondary" sx={{ marginBottom: 2 }}>
                          結婚祝いなど、個別イベントの出費を「何歳のときか」とセットで万円単位登録できます。
                        </Typography>

                        <Stack spacing={2}>
                          {plan.lifeEvents.map((event) => (
                            <Box
                              key={event.id}
                              sx={{
                                display: 'flex',
                                gap: 2,
                                flexWrap: 'wrap',
                                alignItems: 'center'
                              }}
                            >
                              <TextField
                                label="イベント名"
                                value={event.title}
                                onChange={(e) =>
                                  updateLifeEvent(personId, event.id, {
                                    title: e.target.value
                                  })
                                }
                              />
                              <NumberField
                                label="何歳のとき"
                                value={event.age ?? 0}
                                min={0}
                                onValueChange={(value) =>
                                  updateLifeEvent(personId, event.id, {
                                    age: value === null ? null : Number(value)
                                  })
                                }
                              />
                              <NumberField
                                label="金額（万円単位）"
                                value={event.amount ?? 0}
                                min={0}
                                onValueChange={(value) =>
                                  updateLifeEvent(personId, event.id, {
                                    amount: value === null ? null : Number(value)
                                  })
                                }
                              />
                              <IconButton aria-label="delete" onClick={() => deleteLifeEvent(personId, event.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          ))}

                          <Box>
                            <Button variant="outlined" onClick={() => addLifeEvent(personId)}>
                              + ライフイベントを追加
                            </Button>
                          </Box>
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              )
            })}
          </Stack>
        )}
      </Box>
    </Box>
  )
}
