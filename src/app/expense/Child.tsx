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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DeleteIcon from '@mui/icons-material/Delete'
import Navi from '@/components/common/Navi'
import NumberField from '@/components/common/NumberField'
import { useFamilyStore } from '@/store/useFamilyStore'
import { useChildStore, type ChildExpensePlan, type EarlyEducationType, type SchoolType } from '@/store/useChildStore'
import HelpIcon from '@mui/icons-material/Help'
import { useState } from 'react'

type HintType = 'earlyEducation' | 'elementarySchool' | 'juniorHighSchool' | 'highSchool' | 'higherEducation'

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
    higherEducationDuration: null,
    lifeEvents: [],
    nextLifeEventId: 0,
    elementaryLessonsAmount: null,
    juniorHighLessonsAmount: null,
    highSchoolLessonsAmount: null,
    elementaryTuitionAmount: null,
    juniorHighTuitionAmount: null,
    highSchoolTuitionAmount: null,
    earlyEducationTuitionAmount: null,
    nurseryTuitionAmountUnder3: null,
    nurseryTuitionAmountOver3: null,
    earlyEducationLessonsAmount: null,
    higherEducationTuitionAmount: null,
    higherEducationLessonsAmount: null,

    // お小遣い
    elementaryAllowanceAmount: 0,
    juniorHighAllowanceAmount: 0,
    highSchoolAllowanceAmount: 0
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

const ChildSchoolSelect = ({
  label,
  value,
  onChange
}: {
  label: string
  value: SchoolType
  onChange: (value: SchoolType) => void
}) => {
  return (
    <FormControl sx={{ minWidth: 150, width: 150 }}>
      <InputLabel>{label}</InputLabel>
      <Select value={value} label={label} onChange={(e: SelectChangeEvent) => onChange(e.target.value as SchoolType)}>
        {SCHOOL_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

const HintDialog = (props: { open: boolean; onClose: () => void; type: HintType }) => {
  const { onClose, open } = props

  const handleClose = () => {
    onClose()
  }

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>費用の目安</DialogTitle>
      <DialogContent sx={{ width: 400, height: 300 }}>
        <Typography> TODO: 費用の目安を表示する </Typography>
        {props.type === 'earlyEducation' && '幼少期の進路の説明'}
        {props.type === 'elementarySchool' && '小学校の進路の説明'}
        {props.type === 'juniorHighSchool' && '中学校の進路の説明'}
        {props.type === 'highSchool' && '高校の進路の説明'}
        {props.type === 'higherEducation' && '大学の進路の説明'}
      </DialogContent>
    </Dialog>
  )
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
  const [open, setOpen] = useState(false)
  const [hintType, setHintType] = useState<HintType>('earlyEducation')

  const handleClickOpen = (type: HintType) => {
    setHintType(type)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

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
                      <Stack spacing={3} sx={{ marginBottom: 1 }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                          <Typography sx={{ width: 100, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                            幼少期{' '}
                            <IconButton onClick={() => handleClickOpen('earlyEducation')}>
                              <HelpIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Typography>
                          <FormControl sx={{ minWidth: 150 }}>
                            <InputLabel>進学先</InputLabel>
                            <Select
                              label="進学先"
                              value={plan.earlyEducationType}
                              onChange={(e: SelectChangeEvent) =>
                                updatePlan(personId, {
                                  earlyEducationType: e.target.value as EarlyEducationType,
                                  earlyEducationStartAge:
                                    e.target.value === 'none' ? null : (plan.earlyEducationStartAge ?? 0)
                                })
                              }
                            >
                              <MenuItem value="none">入れない</MenuItem>
                              <MenuItem value="nursery">保育園</MenuItem>
                              <MenuItem value="kindergarten">幼稚園</MenuItem>
                            </Select>
                          </FormControl>
                          {plan.earlyEducationType !== 'none' && (
                            <>
                              <NumberField
                                label="開始年齢"
                                value={plan.earlyEducationStartAge ?? 0}
                                min={0}
                                width={160}
                                onValueChange={(value) =>
                                  updatePlan(personId, {
                                    earlyEducationStartAge: value === null ? null : Number(value)
                                  })
                                }
                              />
                              {plan.earlyEducationType === 'kindergarten' && (
                                <NumberField
                                  label="学費（年額/万円）"
                                  value={plan.earlyEducationTuitionAmount ?? 0}
                                  min={0}
                                  onValueChange={(value) =>
                                    updatePlan(personId, {
                                      earlyEducationTuitionAmount: value === null ? null : Number(value)
                                    })
                                  }
                                />
                              )}
                              {plan.earlyEducationType === 'nursery' && (
                                <>
                                  <NumberField
                                    label="0〜2歳 学費（年額/万円）"
                                    value={plan.nurseryTuitionAmountUnder3 ?? 0}
                                    min={0}
                                    onValueChange={(value) =>
                                      updatePlan(personId, {
                                        nurseryTuitionAmountUnder3: value === null ? null : Number(value)
                                      })
                                    }
                                  />
                                  <NumberField
                                    label="3〜5歳 学費（年額/万円）"
                                    value={plan.nurseryTuitionAmountOver3 ?? 0}
                                    min={0}
                                    onValueChange={(value) =>
                                      updatePlan(personId, {
                                        nurseryTuitionAmountOver3: value === null ? null : Number(value)
                                      })
                                    }
                                  />
                                </>
                              )}
                              <NumberField
                                label="習い事（年額/万円）"
                                value={plan.earlyEducationLessonsAmount ?? 0}
                                min={0}
                                width={180}
                                onValueChange={(value) =>
                                  updatePlan(personId, {
                                    earlyEducationLessonsAmount: value === null ? null : Number(value)
                                  })
                                }
                              />
                            </>
                          )}
                        </Box>
                      </Stack>

                      <Stack spacing={3}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                          <Typography sx={{ width: 100, fontWeight: 'bold' }}>
                            小学校
                            <IconButton onClick={() => handleClickOpen('elementarySchool')}>
                              <HelpIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Typography>
                          <ChildSchoolSelect
                            label="進学先"
                            value={plan.elementarySchoolType}
                            onChange={(value) => updatePlan(personId, { elementarySchoolType: value })}
                          />
                          <NumberField
                            label="学費（年額/万円）"
                            value={plan.elementaryTuitionAmount ?? 0}
                            min={0}
                            width={180}
                            onValueChange={(value) =>
                              updatePlan(personId, {
                                elementaryTuitionAmount: value === null ? null : Number(value)
                              })
                            }
                          />
                          <NumberField
                            label="習い事（年額/万円）"
                            value={plan.elementaryLessonsAmount ?? 0}
                            min={0}
                            width={180}
                            onValueChange={(value) =>
                              updatePlan(personId, {
                                elementaryLessonsAmount: value === null ? null : Number(value)
                              })
                            }
                          />
                          <NumberField
                            label="お小遣い（年額/万円）"
                            value={plan.elementaryAllowanceAmount ?? 0}
                            min={0}
                            width={180}
                            onValueChange={(value) =>
                              updatePlan(personId, {
                                elementaryAllowanceAmount: value === null ? null : Number(value)
                              })
                            }
                          />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                          <Typography sx={{ width: 100, fontWeight: 'bold' }}>
                            中学校
                            <IconButton onClick={() => handleClickOpen('juniorHighSchool')}>
                              <HelpIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Typography>
                          <ChildSchoolSelect
                            label="進学先"
                            value={plan.juniorHighSchoolType}
                            onChange={(value) => updatePlan(personId, { juniorHighSchoolType: value })}
                          />
                          <NumberField
                            label="学費（年額/万円）"
                            value={plan.juniorHighTuitionAmount ?? 0}
                            min={0}
                            width={180}
                            onValueChange={(value) =>
                              updatePlan(personId, {
                                juniorHighTuitionAmount: value === null ? null : Number(value)
                              })
                            }
                          />
                          <NumberField
                            label="習い事（年額/万円）"
                            value={plan.juniorHighLessonsAmount ?? 0}
                            min={0}
                            width={180}
                            onValueChange={(value) =>
                              updatePlan(personId, {
                                juniorHighLessonsAmount: value === null ? null : Number(value)
                              })
                            }
                          />
                          <NumberField
                            label="お小遣い（年額/万円）"
                            value={plan.juniorHighAllowanceAmount ?? 0}
                            min={0}
                            width={180}
                            onValueChange={(value) =>
                              updatePlan(personId, {
                                juniorHighAllowanceAmount: value === null ? null : Number(value)
                              })
                            }
                          />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                          <Typography sx={{ width: 100, fontWeight: 'bold' }}>
                            高校
                            <IconButton onClick={() => handleClickOpen('highSchool')}>
                              <HelpIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Typography>
                          <ChildSchoolSelect
                            label="進学先"
                            value={plan.highSchoolType}
                            onChange={(value) => updatePlan(personId, { highSchoolType: value })}
                          />
                          <NumberField
                            label="学費（年額/万円）"
                            value={plan.highSchoolTuitionAmount ?? 0}
                            min={0}
                            width={180}
                            onValueChange={(value) =>
                              updatePlan(personId, {
                                highSchoolTuitionAmount: value === null ? null : Number(value)
                              })
                            }
                          />
                          <NumberField
                            label="習い事（年額/万円）"
                            value={plan.highSchoolLessonsAmount ?? 0}
                            min={0}
                            width={180}
                            onValueChange={(value) =>
                              updatePlan(personId, {
                                highSchoolLessonsAmount: value === null ? null : Number(value)
                              })
                            }
                          />
                          <NumberField
                            label="お小遣い（年額/万円）"
                            value={plan.highSchoolAllowanceAmount ?? 0}
                            min={0}
                            width={180}
                            onValueChange={(value) =>
                              updatePlan(personId, {
                                highSchoolAllowanceAmount: value === null ? null : Number(value)
                              })
                            }
                          />
                        </Box>
                      </Stack>

                      <Stack spacing={3} sx={{ marginTop: 3, marginBottom: 4 }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                          <Typography sx={{ width: 100, fontWeight: 'bold' }}>
                            高等教育
                            <IconButton onClick={() => handleClickOpen('higherEducation')}>
                              <HelpIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Typography>
                          <FormControl sx={{ minWidth: 150 }}>
                            <InputLabel>進学先</InputLabel>
                            <Select
                              value={plan.higherEducationType}
                              label="進学先"
                              onChange={(e: SelectChangeEvent) =>
                                updatePlan(personId, {
                                  higherEducationType: e.target.value as ChildExpensePlan['higherEducationType']
                                })
                              }
                            >
                              <MenuItem value="none">進学しない</MenuItem>
                              <MenuItem value="university">大学</MenuItem>
                              <MenuItem value="juniorCollege">短大</MenuItem>
                              <MenuItem value="vocational">専門</MenuItem>
                            </Select>
                          </FormControl>

                          {plan.higherEducationType !== 'none' && (
                            <>
                              <NumberField
                                label="期間（年）"
                                value={plan.higherEducationDuration ?? 0}
                                min={0}
                                width={120}
                                onValueChange={(value) =>
                                  updatePlan(personId, {
                                    higherEducationDuration: value === null ? null : Number(value)
                                  })
                                }
                              />
                              <NumberField
                                label="学費（年額/万円）"
                                value={plan.higherEducationTuitionAmount ?? 0}
                                min={0}
                                width={180}
                                onValueChange={(value) =>
                                  updatePlan(personId, {
                                    higherEducationTuitionAmount: value === null ? null : Number(value)
                                  })
                                }
                              />
                              <NumberField
                                label="習い事（年額/万円）"
                                value={plan.higherEducationLessonsAmount ?? 0}
                                min={0}
                                width={180}
                                onValueChange={(value) =>
                                  updatePlan(personId, {
                                    higherEducationLessonsAmount: value === null ? null : Number(value)
                                  })
                                }
                              />
                            </>
                          )}
                        </Box>
                      </Stack>

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

      <HintDialog open={open} onClose={handleClose} type={hintType} />
    </Box>
  )
}
