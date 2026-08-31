import { useQuery } from '@tanstack/react-query'
import { getVocabularyStats } from '../api/word-sense-api'
import { WORD_QUERY_KEYS } from './query-keys'

export function useVocabularyStatsQuery() {
  return useQuery({
    queryKey: WORD_QUERY_KEYS.stats,
    queryFn: ({ signal }) => getVocabularyStats(signal),
  })
}
