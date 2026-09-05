import type { VocabularyPreferences } from './types'

export const VOCABULARY_MAX_OFFSET = 100_000
export const VOCABULARY_PAGE_SIZES = [15, 30, 50]
export const VOCABULARY_REQUEST_DELAY_MS = 180
export const VOCABULARY_SEARCH_MAX_LENGTH = 100
export const VOCABULARY_SEARCH_PARAMS = {
  level: 'level',
  page: 'page',
  pageSize: 'pageSize',
  search: 'search',
  status: 'status',
}
export const DEFAULT_VOCABULARY_PREFERENCES: VocabularyPreferences = {
  search: '',
  level: '',
  page: 1,
  pageSize: VOCABULARY_PAGE_SIZES[0],
  status: '',
}
