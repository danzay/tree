import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import {
  useWordInfo,
  useWordSense,
  useWordSensesQuery,
  type VocabularySense,
  type WordsResponse,
} from '@/entities/word'
import { useQueryErrorMessage } from '@/shared/api/useQueryErrorMessage'
import { useDebouncedValue } from '@/shared/lib/hooks/useDebouncedValue'
import { VOCABULARY_REQUEST_DELAY_MS, VOCABULARY_SEARCH_MAX_LENGTH } from './consts'
import { getVocabularyPreferences } from './utils/getVocabularyPreferences'
import { getVocabularySearchParams } from './utils/getVocabularySearchParams'

export function useVocabularyPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedWord, setSelectedWord] = useState<VocabularySense | null>(null)
  const preferences = useMemo(() => getVocabularyPreferences(searchParams), [searchParams])
  const debouncedSearch = useDebouncedValue(preferences.search, VOCABULARY_REQUEST_DELAY_MS)
  const wordsQuery = useWordSensesQuery({
    search: debouncedSearch,
    level: preferences.level,
    status: preferences.status,
    limit: preferences.pageSize,
    offset: (preferences.page - 1) * preferences.pageSize,
  })
  const selectedSenseId = selectedWord ? Number(selectedWord.id) : null
  const selectedWordQuery = useWordSense(selectedSenseId)
  const wordInfo = useWordInfo(selectedWord?.word ?? null)
  const words: WordsResponse = wordsQuery.data ?? {
    items: [],
    total: 0,
    limit: preferences.pageSize,
    offset: 0,
  }
  const { level, page, pageSize, search, status } = preferences
  const totalPages = Math.max(1, Math.ceil(words.total / pageSize))
  const error = useQueryErrorMessage(wordsQuery, 'vocabulary.errors.loading')

  useEffect(() => {
    if (wordsQuery.isSuccess && page > totalPages) {
      const nextPreferences = { ...preferences, page: totalPages }
      setSearchParams(getVocabularySearchParams(nextPreferences), { replace: true })
    }
  }, [page, preferences, setSearchParams, totalPages, wordsQuery.isSuccess])

  const updatePreferences = (nextPreferences: typeof preferences) => {
    setSearchParams(getVocabularySearchParams(nextPreferences), { replace: true })
  }

  const closeWord = () => {
    setSelectedWord(null)
  }

  const selectWord = (sense: VocabularySense) => {
    setSelectedWord(sense)
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

  const setPageSize = (nextPageSize: number) => {
    updatePreferences({
      ...preferences,
      page: 1,
      pageSize: nextPageSize,
    })
  }

  const setSearch = (nextSearch: string) => {
    updatePreferences({
      ...preferences,
      search: nextSearch.slice(0, VOCABULARY_SEARCH_MAX_LENGTH),
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
    pageSize,
    search,
    selectedSenseId,
    selectedWord: selectedWordQuery,
    selectWord,
    closeWord,
    setLevel,
    setPage,
    setPageSize,
    setSearch,
    setStatus,
    status,
    totalPages,
    wordInfo,
    words,
  }
}
