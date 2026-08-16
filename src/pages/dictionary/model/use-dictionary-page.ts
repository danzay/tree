import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getVocabularyStats,
  getWordSenses,
  type StatsResponse,
  type WordsResponse,
} from '@/entities/word-sense'
import { getRequestErrorMessage, isRequestCanceled } from '@/shared/api/api-client'

export function useDictionaryPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('')
  const [status, setStatus] = useState('')
  const [words, setWords] = useState<WordsResponse>({ items: [], total: 0 })
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
              t('dictionary.errors.statistics'),
              t('dictionary.errors.connection'),
            ),
          )
        }
      })

    return () => controller.abort()
  }, [t])

  useEffect(() => {
    const controller = new AbortController()
    const delay = window.setTimeout(() => {
      setLoading(true)
      setError(null)

      getWordSenses({ search, level, status }, controller.signal)
        .then(setWords)
        .catch((caught: unknown) => {
          if (!isRequestCanceled(caught)) {
            setError(
              getRequestErrorMessage(
                caught,
                t('dictionary.errors.vocabulary'),
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
    }, 180)

    return () => {
      window.clearTimeout(delay)
      controller.abort()
    }
  }, [level, search, status, t])

  return {
    error,
    level,
    loading,
    search,
    setLevel,
    setSearch,
    setStatus,
    stats,
    status,
    words,
  }
}
