import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getRequestErrorMessage, isRequestCanceled } from '@/shared/api/api-client'
import { getWordSense } from '../api/word-sense-api'
import type { VocabularySense } from './types'

interface WordSenseResult {
  error: string | null
  sense: VocabularySense | null
  senseId: number | null
}

export function useWordSense(senseId: number | null) {
  const { t } = useTranslation()
  const [result, setResult] = useState<WordSenseResult>({
    error: null,
    sense: null,
    senseId: null,
  })

  useEffect(() => {
    const controller = new AbortController()

    if (senseId === null) {
      return () => controller.abort()
    }

    getWordSense(senseId, controller.signal)
      .then((sense) => {
        setResult({ error: null, sense, senseId })
      })
      .catch((caught: unknown) => {
        if (!isRequestCanceled(caught)) {
          setResult({
            error: getRequestErrorMessage(
              caught,
              t('word.panel.errors.loading'),
              t('dictionary.errors.connection'),
            ),
            sense: null,
            senseId,
          })
        }
      })

    return () => controller.abort()
  }, [senseId, t])

  const hasCurrentResult = result.senseId === senseId

  return {
    error: hasCurrentResult ? result.error : null,
    loading: senseId !== null && !hasCurrentResult,
    sense: hasCurrentResult ? result.sense : null,
  }
}
