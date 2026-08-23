import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getVocabularyStats, type StatsResponse } from '@/entities/word'
import { getRequestErrorMessage, isRequestCanceled } from '@/shared/api/api-client'

export function useProgressPage() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    getVocabularyStats(controller.signal)
      .then(setStats)
      .catch((caught: unknown) => {
        if (!isRequestCanceled(caught)) {
          setError(
            getRequestErrorMessage(
              caught,
              t('progress.errors.loading'),
              t('dictionary.errors.connection'),
            ),
          )
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [t])

  const overview = useMemo(() => {
    const total = stats?.senses ?? 0
    const known = (stats?.byStatus.known ?? 0) + (stats?.byStatus.learned ?? 0)

    return {
      known,
      leftToLearn: Math.max(total - known, 0),
      total,
    }
  }, [stats])

  return { error, loading, overview, stats }
}
