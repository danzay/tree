import { VOCABULARY_LEVELS, type VocabularyLevel } from '@/shared/model/vocabulary-level'

export const PROGRESS_LEVELS_SEARCH_PARAM = 'levels'

export const DEFAULT_PROGRESS_LEVELS: VocabularyLevel[] = VOCABULARY_LEVELS.filter(
  (level) => level !== 'C2',
)
