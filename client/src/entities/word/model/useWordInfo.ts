import { skipToken, useQuery } from '@tanstack/react-query'
import { getDictionaryEntries, getTranslations } from '../api/lexical-api'
import { useQueryErrorMessage } from '@/shared/api/useQueryErrorMessage'
import type { DictionaryEntry, TranslationResponse } from './lexical-types'
import { WORD_QUERY_KEYS } from './query-keys'
import { normalizeWordTerm } from './utils/normalizeWordTerm'

export interface WordInfo {
  term: string | null
  dictionary: {
    data: DictionaryEntry[] | null
    error: string | null
    loading: boolean
  }
  translation: {
    data: TranslationResponse | null
    error: string | null
    loading: boolean
  }
}

export function useWordInfo(term: string | null): WordInfo {
  const normalizedTerm = term === null ? null : normalizeWordTerm(term)
  const hasTerm = normalizedTerm !== null && normalizedTerm.length > 0
  const dictionaryQuery = useQuery({
    queryKey: WORD_QUERY_KEYS.definitions(normalizedTerm),
    queryFn: hasTerm ? ({ signal }) => getDictionaryEntries(normalizedTerm, signal) : skipToken,
    refetchOnWindowFocus: false,
    retry: false,
  })
  const translationQuery = useQuery({
    queryKey: WORD_QUERY_KEYS.translations(normalizedTerm),
    queryFn: hasTerm ? ({ signal }) => getTranslations(normalizedTerm, signal) : skipToken,
  })
  const dictionaryError = useQueryErrorMessage(dictionaryQuery, 'word.lexical.errors.definition')
  const translationError = useQueryErrorMessage(translationQuery, 'word.lexical.errors.translation')

  return {
    term: normalizedTerm,
    dictionary: {
      data: dictionaryQuery.data ?? null,
      error: dictionaryError,
      loading: dictionaryQuery.isLoading,
    },
    translation: {
      data: translationQuery.data ?? null,
      error: translationError,
      loading: translationQuery.isLoading,
    },
  }
}
