import { LearningStatus } from '../../model/types'

export const WORD_STATUS_ACTIONS = [
  {
    labelKey: 'word.status.actions.learning',
    status: LearningStatus.learning,
  },
  {
    labelKey: 'word.status.actions.known',
    status: LearningStatus.known,
  },
  {
    labelKey: 'word.status.actions.to_learn',
    status: LearningStatus.to_learn,
  },
]
