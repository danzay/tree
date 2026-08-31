import { DEFAULT_DICTIONARY_PREFERENCES, DICTIONARY_SEARCH_PARAMS } from '../consts'
import type { DictionaryPreferences } from '../types'

export function getDictionarySearchParams(preferences: DictionaryPreferences) {
  const searchParams = new URLSearchParams()

  if (preferences.search !== DEFAULT_DICTIONARY_PREFERENCES.search) {
    searchParams.set(DICTIONARY_SEARCH_PARAMS.search, preferences.search)
  }

  if (preferences.level !== DEFAULT_DICTIONARY_PREFERENCES.level) {
    searchParams.set(DICTIONARY_SEARCH_PARAMS.level, preferences.level)
  }

  if (preferences.status !== DEFAULT_DICTIONARY_PREFERENCES.status) {
    searchParams.set(DICTIONARY_SEARCH_PARAMS.status, preferences.status)
  }

  if (preferences.page !== DEFAULT_DICTIONARY_PREFERENCES.page) {
    searchParams.set(DICTIONARY_SEARCH_PARAMS.page, String(preferences.page))
  }

  return searchParams
}
