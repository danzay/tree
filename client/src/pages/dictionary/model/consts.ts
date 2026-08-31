import type { DictionaryPreferences } from './types'

export const DICTIONARY_MAX_OFFSET = 100_000
export const DICTIONARY_PAGE_SIZE = 30
export const DICTIONARY_REQUEST_DELAY_MS = 180
export const DICTIONARY_SEARCH_MAX_LENGTH = 100
export const MAX_DICTIONARY_PAGE = Math.floor(DICTIONARY_MAX_OFFSET / DICTIONARY_PAGE_SIZE) + 1
export const DICTIONARY_SEARCH_PARAMS = {
  level: 'level',
  page: 'page',
  search: 'search',
  status: 'status',
}
export const DEFAULT_DICTIONARY_PREFERENCES: DictionaryPreferences = {
  search: '',
  level: '',
  status: '',
  page: 1,
}
