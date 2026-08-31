import { VOCABULARY_LEVELS } from '@/shared/model/vocabulary-level'
import { LEARNING_STATUSES } from '../options'
import {
  DEFAULT_DICTIONARY_PREFERENCES,
  DICTIONARY_SEARCH_PARAMS,
  DICTIONARY_SEARCH_MAX_LENGTH,
  MAX_DICTIONARY_PAGE,
} from '../consts'
import type { DictionaryPreferences } from '../types'

export function getDictionaryPreferences(searchParams: URLSearchParams): DictionaryPreferences {
  const candidateSearch = searchParams.get(DICTIONARY_SEARCH_PARAMS.search) ?? ''
  const candidateLevel = searchParams.get(DICTIONARY_SEARCH_PARAMS.level) ?? ''
  const candidateStatus = searchParams.get(DICTIONARY_SEARCH_PARAMS.status) ?? ''
  const candidatePage = Number(searchParams.get(DICTIONARY_SEARCH_PARAMS.page))
  const searchIsValid = candidateSearch.length <= DICTIONARY_SEARCH_MAX_LENGTH
  const levelIsValid =
    candidateLevel === '' || VOCABULARY_LEVELS.some((level) => level === candidateLevel)
  const statusIsValid =
    candidateStatus === '' || LEARNING_STATUSES.some((status) => status === candidateStatus)
  const pageIsValid =
    Number.isInteger(candidatePage) && candidatePage >= 1 && candidatePage <= MAX_DICTIONARY_PAGE

  return {
    search: searchIsValid ? candidateSearch : DEFAULT_DICTIONARY_PREFERENCES.search,
    level: levelIsValid ? candidateLevel : DEFAULT_DICTIONARY_PREFERENCES.level,
    status: statusIsValid ? candidateStatus : DEFAULT_DICTIONARY_PREFERENCES.status,
    page: pageIsValid ? candidatePage : DEFAULT_DICTIONARY_PREFERENCES.page,
  }
}
