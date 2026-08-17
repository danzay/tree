import type { MouseEvent, PointerEvent } from 'react'
import {
  MAX_SELECTED_TEXT_LENGTH,
  SELECTION_WHITESPACE_PATTERN,
  WORD_SENSE_SELECTOR,
} from './consts'

interface ArticleContentInteractionsOptions {
  onTextSelect: (text: string) => void
  onWordSelect: (senseId: number) => void
}

function closestWordElement(node: Node | null): HTMLElement | null {
  const element = node instanceof Element ? node : node?.parentElement
  return element?.closest<HTMLElement>(WORD_SENSE_SELECTOR) ?? null
}

function senseIdFromElement(element: HTMLElement | null): number | null {
  const senseId = Number(element?.dataset.senseId)
  const hasValidSenseId = Number.isInteger(senseId) && senseId > 0
  if (!hasValidSenseId) {
    return null
  }

  return senseId
}

export function useArticleContentInteractions({
  onTextSelect,
  onWordSelect,
}: ArticleContentInteractionsOptions) {
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const selection = window.getSelection()
    const selectedText = selection?.toString().trim() ?? ''
    const hasTextSelection = selectedText.length > 0
    if (hasTextSelection) {
      return
    }

    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    const wordElement = target.closest<HTMLElement>(WORD_SENSE_SELECTOR)
    const isArticleWord = wordElement && event.currentTarget.contains(wordElement)
    if (!isArticleWord) {
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

  return { handleClick, handlePointerUp }
}
