import type { WordSenseQuery } from './types'

export const WORD_QUERY_KEYS = {
  definitions: (term: string | null) => ['words', 'definitions', term],
  list: (query: WordSenseQuery) => ['words', 'list', query],
  lists: ['words', 'list'],
  sense: (id: number | null) => ['words', 'sense', id],
  stats: ['words', 'stats'],
  translations: (term: string | null) => ['words', 'translations', term],
}
