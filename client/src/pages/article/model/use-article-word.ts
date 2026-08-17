import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getWordSense, type VocabularySense } from '@/entities/word-sense'
import { getRequestErrorMessage, isRequestCanceled } from '@/shared/api/api-client'

interface ArticleWordResult {
  error: string | null
  sense: VocabularySense | null
  senseId: number | null
}

export function useArticleWord(senseId: number | null) {
  const { t } = useTranslation()
  const [result, setResult] = useState<ArticleWordResult>({
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
              t('article.wordPanel.errors.loading'),
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
