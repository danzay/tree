import type { VocabularyLevel } from '@/shared/model/vocabulary-level'
import { VOCABULARY_LEVELS } from '@/shared/model/vocabulary-level'
import { DEFAULT_PROGRESS_LEVELS, PROGRESS_LEVELS_SEARCH_PARAM } from '../consts'

const LEVEL_SEPARATOR = ','

export function getProgressLevels(searchParams: URLSearchParams): VocabularyLevel[] {
  const levelParameter = searchParams.get(PROGRESS_LEVELS_SEARCH_PARAM)

  if (levelParameter === null) {
    return DEFAULT_PROGRESS_LEVELS
  }

  const requestedLevels = new Set(levelParameter.split(LEVEL_SEPARATOR))
  const validLevels = VOCABULARY_LEVELS.filter((level) => requestedLevels.has(level))

  if (validLevels.length === 0) {
    return DEFAULT_PROGRESS_LEVELS
  }

  return validLevels
}
