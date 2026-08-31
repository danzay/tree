import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { getWordSenses, type WordsResponse } from '@/entities/word'
import { getRequestErrorMessage, isRequestCanceled } from '@/shared/api/api-client'
import {
  DICTIONARY_PAGE_SIZE,
  DICTIONARY_REQUEST_DELAY_MS,
  DICTIONARY_SEARCH_MAX_LENGTH,
} from './consts'
import { getDictionaryPreferences } from './utils/getDictionaryPreferences'
import { getDictionarySearchParams } from './utils/getDictionarySearchParams'

export function useDictionaryPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const preferences = useMemo(() => getDictionaryPreferences(searchParams), [searchParams])
  const [words, setWords] = useState<WordsResponse>({
    items: [],
    total: 0,
    limit: DICTIONARY_PAGE_SIZE,
    offset: 0,
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { level, page, search, status } = preferences
  const totalPages = Math.max(1, Math.ceil(words.total / DICTIONARY_PAGE_SIZE))

  useEffect(() => {
    const controller = new AbortController()
    const delay = window.setTimeout(() => {
      setLoading(true)
      setError(null)

      getWordSenses(
        {
          search,
          level,
          status,
          limit: DICTIONARY_PAGE_SIZE,
          offset: (page - 1) * DICTIONARY_PAGE_SIZE,
        },
        controller.signal,
      )
        .then((response) => {
          const responseTotalPages = Math.max(1, Math.ceil(response.total / DICTIONARY_PAGE_SIZE))

          setWords(response)
          if (page > responseTotalPages) {
            const nextPreferences = { ...preferences, page: responseTotalPages }
            setSearchParams(getDictionarySearchParams(nextPreferences), { replace: true })
          }
        })
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
    }, DICTIONARY_REQUEST_DELAY_MS)

    return () => {
      window.clearTimeout(delay)
      controller.abort()
    }
  }, [level, page, preferences, search, setSearchParams, status, t])

  const updatePreferences = (nextPreferences: typeof preferences) => {
    setSearchParams(getDictionarySearchParams(nextPreferences), { replace: true })
  }

  const setLevel = (nextLevel: string) => {
    updatePreferences({
      ...preferences,
      level: nextLevel,
      page: 1,
    })
  }

  const setPage = (nextPage: number) => {
    const boundedPage = Math.min(Math.max(nextPage, 1), totalPages)
    updatePreferences({ ...preferences, page: boundedPage })
  }

  const setSearch = (nextSearch: string) => {
    updatePreferences({
      ...preferences,
      search: nextSearch.slice(0, DICTIONARY_SEARCH_MAX_LENGTH),
      page: 1,
    })
  }

  const setStatus = (nextStatus: string) => {
    updatePreferences({
      ...preferences,
      status: nextStatus,
      page: 1,
    })
  }

  return {
    error,
    level,
    loading,
    page,
    search,
    setLevel,
    setPage,
    setSearch,
    setStatus,
    status,
    totalPages,
    words,
  }
}
