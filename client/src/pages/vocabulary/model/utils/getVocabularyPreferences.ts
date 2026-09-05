import { VOCABULARY_LEVELS } from '@/shared/model/vocabulary-level'
import { LEARNING_STATUSES } from '../options'
import {
  DEFAULT_VOCABULARY_PREFERENCES,
  VOCABULARY_MAX_OFFSET,
  VOCABULARY_PAGE_SIZES,
  VOCABULARY_SEARCH_PARAMS,
  VOCABULARY_SEARCH_MAX_LENGTH,
} from '../consts'
import type { VocabularyPreferences } from '../types'

export function getVocabularyPreferences(searchParams: URLSearchParams): VocabularyPreferences {
  const candidateSearch = searchParams.get(VOCABULARY_SEARCH_PARAMS.search) ?? ''
  const candidateLevel = searchParams.get(VOCABULARY_SEARCH_PARAMS.level) ?? ''
  const candidateStatus = searchParams.get(VOCABULARY_SEARCH_PARAMS.status) ?? ''
  const candidatePage = Number(searchParams.get(VOCABULARY_SEARCH_PARAMS.page))
  const candidatePageSize = Number(searchParams.get(VOCABULARY_SEARCH_PARAMS.pageSize))
  const searchIsValid = candidateSearch.length <= VOCABULARY_SEARCH_MAX_LENGTH
  const levelIsValid =
    candidateLevel === '' || VOCABULARY_LEVELS.some((level) => level === candidateLevel)
  const statusIsValid =
    candidateStatus === '' || LEARNING_STATUSES.some((status) => status === candidateStatus)
  const pageSizeIsValid = VOCABULARY_PAGE_SIZES.some((pageSize) => pageSize === candidatePageSize)
  const pageSize = pageSizeIsValid ? candidatePageSize : DEFAULT_VOCABULARY_PREFERENCES.pageSize
  const maxPage = Math.floor(VOCABULARY_MAX_OFFSET / pageSize) + 1
  const pageIsValid =
    Number.isInteger(candidatePage) && candidatePage >= 1 && candidatePage <= maxPage

  return {
    search: searchIsValid ? candidateSearch : DEFAULT_VOCABULARY_PREFERENCES.search,
    level: levelIsValid ? candidateLevel : DEFAULT_VOCABULARY_PREFERENCES.level,
    status: statusIsValid ? candidateStatus : DEFAULT_VOCABULARY_PREFERENCES.status,
    page: pageIsValid ? candidatePage : DEFAULT_VOCABULARY_PREFERENCES.page,
    pageSize,
  }
}
