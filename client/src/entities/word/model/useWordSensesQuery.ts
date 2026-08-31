import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getWordSenses } from '../api/word-sense-api'
import { WORD_QUERY_KEYS } from './query-keys'
import type { WordSenseQuery } from './types'

export function useWordSensesQuery(query: WordSenseQuery) {
  return useQuery({
    queryKey: WORD_QUERY_KEYS.list(query),
    queryFn: ({ signal }) => getWordSenses(query, signal),
    placeholderData: keepPreviousData,
  })
}
