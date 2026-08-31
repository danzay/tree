import { useMemo } from 'react'
import { useVocabularyStatsQuery } from '@/entities/word'
import { useQueryErrorMessage } from '@/shared/api/useQueryErrorMessage'

export function useProgressPage() {
  const statsQuery = useVocabularyStatsQuery()
  const stats = statsQuery.data ?? null
  const error = useQueryErrorMessage(statsQuery, 'progress.errors.loading')

  const overview = useMemo(() => {
    const total = stats?.senses ?? 0
    const known = (stats?.byStatus.known ?? 0) + (stats?.byStatus.learned ?? 0)

    return {
      known,
      leftToLearn: Math.max(total - known, 0),
      total,
    }
  }, [stats])

  return { error, loading: statsQuery.isLoading, overview, stats }
}
