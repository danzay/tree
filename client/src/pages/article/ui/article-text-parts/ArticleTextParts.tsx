import type { ReactNode } from 'react'
import type { ArticleBlock } from '@/entities/library-item'
import { HighlightedWord } from '../highlighted-word/HighlightedWord'

interface ArticleTextPartsProps {
  block: ArticleBlock
  selectedSenseId: number | null
}

export function ArticleTextParts({ block, selectedSenseId }: ArticleTextPartsProps) {
  const parts: ReactNode[] = []
  let position = 0

  block.highlights.forEach((highlight) => {
    const hasInvalidRange = highlight.start < position || highlight.end > block.text.length
    if (hasInvalidRange) {
      return
    }

    if (highlight.start > position) {
      parts.push(block.text.slice(position, highlight.start))
    }

    parts.push(
      <HighlightedWord
        highlight={highlight}
        key={`${highlight.start}-${highlight.end}`}
        selectedSenseId={selectedSenseId}
        text={block.text}
      />,
    )
    position = highlight.end
  })

  if (position < block.text.length) {
    parts.push(block.text.slice(position))
  }

  return parts
}
