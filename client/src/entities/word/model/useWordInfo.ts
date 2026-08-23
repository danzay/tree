import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getDictionaryEntries, getTranslations } from '../api/lexical-api'
import { getRequestErrorMessage, isRequestCanceled } from '@/shared/api/api-client'
import type { DictionaryEntry, TranslationResponse } from './lexical-types'
import { normalizeWordTerm } from './utils/normalizeWordTerm'

interface RequestResult<T> {
  data: T | null
  error: string | null
  term: string | null
}

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
  const { t } = useTranslation()
  const normalizedTerm = term === null ? null : normalizeWordTerm(term)
  const [dictionary, setDictionary] = useState<RequestResult<DictionaryEntry[]>>({
    data: null,
    error: null,
    term: null,
  })
  const [translation, setTranslation] = useState<RequestResult<TranslationResponse>>({
    data: null,
    error: null,
    term: null,
  })

  useEffect(() => {
    const controller = new AbortController()

    if (normalizedTerm === null || normalizedTerm.length === 0) {
      return () => controller.abort()
    }

    getDictionaryEntries(normalizedTerm, controller.signal)
      .then((data) => {
        setDictionary({ data, error: null, term: normalizedTerm })
      })
      .catch((caught: unknown) => {
        if (!isRequestCanceled(caught)) {
          setDictionary({
            data: null,
            error: getRequestErrorMessage(
              caught,
              t('word.lexical.errors.definition'),
              t('dictionary.errors.connection'),
            ),
            term: normalizedTerm,
          })
        }
      })

    getTranslations(normalizedTerm, controller.signal)
      .then((data) => {
        setTranslation({ data, error: null, term: normalizedTerm })
      })
      .catch((caught: unknown) => {
        if (!isRequestCanceled(caught)) {
          setTranslation({
            data: null,
            error: getRequestErrorMessage(
              caught,
              t('word.lexical.errors.translation'),
              t('dictionary.errors.connection'),
            ),
            term: normalizedTerm,
          })
        }
      })

    return () => controller.abort()
  }, [normalizedTerm, t])

  const hasCurrentDictionary = dictionary.term === normalizedTerm
  const hasCurrentTranslation = translation.term === normalizedTerm

  return {
    term: normalizedTerm,
    dictionary: {
      data: hasCurrentDictionary ? dictionary.data : null,
      error: hasCurrentDictionary ? dictionary.error : null,
      loading: normalizedTerm !== null && !hasCurrentDictionary,
    },
    translation: {
      data: hasCurrentTranslation ? translation.data : null,
      error: hasCurrentTranslation ? translation.error : null,
      loading: normalizedTerm !== null && !hasCurrentTranslation,
    },
  }
}
