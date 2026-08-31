import { skipToken, useQuery } from '@tanstack/react-query'
import { useQueryErrorMessage } from '@/shared/api/useQueryErrorMessage'
import { getWordSense } from '../api/word-sense-api'
import { WORD_QUERY_KEYS } from './query-keys'

export function useWordSense(senseId: number | null) {
  const senseQuery = useQuery({
    queryKey: WORD_QUERY_KEYS.sense(senseId),
    queryFn: senseId === null ? skipToken : ({ signal }) => getWordSense(senseId, signal),
  })
  const error = useQueryErrorMessage(senseQuery, 'word.panel.errors.loading')

  return {
    error,
    loading: senseQuery.isLoading,
    sense: senseQuery.data ?? null,
  }
}
