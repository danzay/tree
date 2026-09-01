import type { PointerEvent } from 'react'
import {
  MAX_SELECTED_TEXT_LENGTH,
  SELECTION_WHITESPACE_PATTERN,
  WORD_SENSE_SELECTOR,
} from './consts'
import { closestWordElement } from './utils/closestWordElement'
import { senseIdFromElement } from './utils/senseIdFromElement'

interface ArticleContentInteractionsOptions {
  onTextSelect: (text: string) => void
  onWordSelect: (senseId: number) => void
}

export function useArticleContentInteractions({
  onTextSelect,
  onWordSelect,
}: ArticleContentInteractionsOptions) {
  const selectWordFromTarget = (event: PointerEvent<HTMLDivElement>) => {
    const target = event.target

    if (!(target instanceof Element)) {
      return
    }

    const wordElement = target.closest<HTMLElement>(WORD_SENSE_SELECTOR)
    const isWordInsideContent = wordElement && event.currentTarget.contains(wordElement)

    if (!isWordInsideContent) {
      return
    }

    const senseId = senseIdFromElement(wordElement)

    if (senseId === null) {
      return
    }

    onWordSelect(senseId)
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const selection = window.getSelection()

    if (!selection || selection.isCollapsed) {
      selectWordFromTarget(event)

      return
    }

    const selectionStartsInside =
      selection.anchorNode && event.currentTarget.contains(selection.anchorNode)
    const selectionEndsInside =
      selection.focusNode && event.currentTarget.contains(selection.focusNode)
    const selectionIsInsideArticle = selectionStartsInside && selectionEndsInside

    if (!selectionIsInsideArticle) {
      return
    }

    const selectedText = selection.toString().replace(SELECTION_WHITESPACE_PATTERN, ' ').trim()
    const hasValidSelection =
      selectedText.length > 0 && selectedText.length <= MAX_SELECTED_TEXT_LENGTH

    if (!hasValidSelection) {
      return
    }

    const wordElement = closestWordElement(selection.anchorNode)
    const selectionEndsInWord = wordElement && wordElement.contains(selection.focusNode)
    const senseId = selectionEndsInWord ? senseIdFromElement(wordElement) : null

    if (senseId !== null) {
      onWordSelect(senseId)

      return
    }

    onTextSelect(selectedText)
  }

  return { handlePointerUp }
}
