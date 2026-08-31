import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { useWordSensesQuery, type WordsResponse } from '@/entities/word'
import { useQueryErrorMessage } from '@/shared/api/useQueryErrorMessage'
import { useDebouncedValue } from '@/shared/lib/hooks/useDebouncedValue'
import {
  DICTIONARY_PAGE_SIZE,
  DICTIONARY_REQUEST_DELAY_MS,
  DICTIONARY_SEARCH_MAX_LENGTH,
} from './consts'
import { getDictionaryPreferences } from './utils/getDictionaryPreferences'
import { getDictionarySearchParams } from './utils/getDictionarySearchParams'

export function useDictionaryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const preferences = useMemo(() => getDictionaryPreferences(searchParams), [searchParams])
  const debouncedSearch = useDebouncedValue(preferences.search, DICTIONARY_REQUEST_DELAY_MS)
  const wordsQuery = useWordSensesQuery({
    search: debouncedSearch,
    level: preferences.level,
    status: preferences.status,
    limit: DICTIONARY_PAGE_SIZE,
    offset: (preferences.page - 1) * DICTIONARY_PAGE_SIZE,
  })
  const words: WordsResponse = wordsQuery.data ?? {
    items: [],
    total: 0,
    limit: DICTIONARY_PAGE_SIZE,
    offset: 0,
  }
  const { level, page, search, status } = preferences
  const totalPages = Math.max(1, Math.ceil(words.total / DICTIONARY_PAGE_SIZE))
  const error = useQueryErrorMessage(wordsQuery, 'dictionary.errors.vocabulary')

  useEffect(() => {
    if (wordsQuery.isSuccess && page > totalPages) {
      const nextPreferences = { ...preferences, page: totalPages }
      setSearchParams(getDictionarySearchParams(nextPreferences), { replace: true })
    }
  }, [page, preferences, setSearchParams, totalPages, wordsQuery.isSuccess])

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
    loading: wordsQuery.isFetching,
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
