import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { useArticleQuery } from '@/entities/article'
import { useWordInfo, useWordSense } from '@/entities/word'
import { useQueryErrorMessage } from '@/shared/api/useQueryErrorMessage'

export function useArticlePage() {
  const { t } = useTranslation()
  const { itemId } = useParams()
  const parsedItemId = Number(itemId)
  const hasInvalidItemId = !Number.isInteger(parsedItemId) || parsedItemId <= 0
  const [selectedSenseId, setSelectedSenseId] = useState<number | null>(null)
  const [selectedText, setSelectedText] = useState<string | null>(null)
  const selectedWord = useWordSense(selectedSenseId)
  const wordInfoTerm = selectedText ?? selectedWord.sense?.word ?? null
  const wordInfo = useWordInfo(wordInfoTerm)
  const articleQuery = useArticleQuery(hasInvalidItemId ? null : parsedItemId)
  const requestError = useQueryErrorMessage(articleQuery, 'article.errors.loading')
  const displayError = hasInvalidItemId ? t('article.errors.notFound') : requestError

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
    article: articleQuery.data ?? null,
    closeSidebar,
    error: displayError,
    loading: articleQuery.isLoading,
    wordInfo,
    selectedSenseId,
    selectedText,
    selectedWord,
    selectText,
    selectWord,
  }
}
