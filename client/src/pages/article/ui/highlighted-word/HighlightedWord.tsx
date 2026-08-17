import type { ArticleHighlight } from '@/entities/library-item'
import { LEVEL_CLASS_NAMES } from './consts'
import styles from './HighlightedWord.module.scss'

interface HighlightedWordProps {
  highlight: ArticleHighlight
  selectedSenseId: number | null
  text: string
}

export function HighlightedWord({ highlight, selectedSenseId, text }: HighlightedWordProps) {
  const levelClassName = styles[LEVEL_CLASS_NAMES[highlight.level]]
  const isSelected = highlight.senseId === selectedSenseId
  const selectedClassName = isSelected ? styles.selected : ''
  const className = `${styles.highlight} ${levelClassName} ${selectedClassName}`

  return (
    <span className={className} data-sense-id={highlight.senseId}>
      {text.slice(highlight.start, highlight.end)}
    </span>
  )
}
