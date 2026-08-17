import type { ReactNode } from 'react'
import type { ArticleBlock, ArticleHighlight } from '@/entities/library-item'
import { LEVEL_CLASS_NAMES } from './consts'
import styles from './ArticleBlockText.module.scss'

interface ArticleBlockTextProps {
  block: ArticleBlock
}

function highlightedWord(text: string, highlight: ArticleHighlight): ReactNode {
  const levelClassName = styles[LEVEL_CLASS_NAMES[highlight.level]]
  const className = `${styles.highlight} ${levelClassName}`

  return (
    <mark
      className={className}
      data-sense-id={highlight.senseId}
      key={`${highlight.start}-${highlight.end}`}
    >
      {text.slice(highlight.start, highlight.end)}
    </mark>
  )
}

function textParts(block: ArticleBlock): ReactNode[] {
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

    parts.push(highlightedWord(block.text, highlight))
    position = highlight.end
  })

  if (position < block.text.length) {
    parts.push(block.text.slice(position))
  }

  return parts
}

export function ArticleBlockText({ block }: ArticleBlockTextProps) {
  const content = textParts(block)

  if (block.type === 'heading') {
    return <h2>{content}</h2>
  }

  return <p>{content}</p>
}
