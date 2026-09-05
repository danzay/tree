import { DEFAULT_VOCABULARY_PREFERENCES, VOCABULARY_SEARCH_PARAMS } from '../consts'
import type { VocabularyPreferences } from '../types'

export function getVocabularySearchParams(preferences: VocabularyPreferences) {
  const searchParams = new URLSearchParams()

  if (preferences.search !== DEFAULT_VOCABULARY_PREFERENCES.search) {
    searchParams.set(VOCABULARY_SEARCH_PARAMS.search, preferences.search)
  }

  if (preferences.level !== DEFAULT_VOCABULARY_PREFERENCES.level) {
    searchParams.set(VOCABULARY_SEARCH_PARAMS.level, preferences.level)
  }

  if (preferences.status !== DEFAULT_VOCABULARY_PREFERENCES.status) {
    searchParams.set(VOCABULARY_SEARCH_PARAMS.status, preferences.status)
  }

  if (preferences.page !== DEFAULT_VOCABULARY_PREFERENCES.page) {
    searchParams.set(VOCABULARY_SEARCH_PARAMS.page, String(preferences.page))
  }

  if (preferences.pageSize !== DEFAULT_VOCABULARY_PREFERENCES.pageSize) {
    searchParams.set(VOCABULARY_SEARCH_PARAMS.pageSize, String(preferences.pageSize))
  }

  return searchParams
}
