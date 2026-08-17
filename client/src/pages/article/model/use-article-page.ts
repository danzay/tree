import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { getLibraryItem, type LibraryItemDetail } from '@/entities/library-item'
import { getRequestErrorMessage, isRequestCanceled } from '@/shared/api/api-client'
import { useArticleWord } from './use-article-word'

export function useArticlePage() {
  const { t } = useTranslation()
  const { itemId } = useParams()
  const parsedItemId = Number(itemId)
  const hasInvalidItemId = !Number.isInteger(parsedItemId) || parsedItemId <= 0
  const [article, setArticle] = useState<LibraryItemDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSenseId, setSelectedSenseId] = useState<number | null>(null)
  const [selectedText, setSelectedText] = useState<string | null>(null)
  const selectedWord = useArticleWord(selectedSenseId)

  useEffect(() => {
    const controller = new AbortController()

    if (hasInvalidItemId) {
      return () => controller.abort()
    }

    getLibraryItem(parsedItemId, controller.signal)
      .then(setArticle)
      .catch((caught: unknown) => {
        if (!isRequestCanceled(caught)) {
          setError(
            getRequestErrorMessage(
              caught,
              t('article.errors.loading'),
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
  }, [hasInvalidItemId, parsedItemId, t])

  const displayError = hasInvalidItemId ? t('article.errors.notFound') : error
  const displayLoading = hasInvalidItemId ? false : loading

  const closeSidebar = () => {
    setSelectedSenseId(null)
    setSelectedText(null)
  }

  const selectText = (text: string) => {
    setSelectedSenseId(null)
    setSelectedText(text)
  }

  const selectWord = (senseId: number) => {
    setSelectedText(null)
    setSelectedSenseId(senseId)
  }

  return {
    article,
    closeSidebar,
    error: displayError,
    loading: displayLoading,
    selectedSenseId,
    selectedText,
    selectedWord,
    selectText,
    selectWord,
  }
}
