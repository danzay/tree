import type { ArticleBlock } from '../../model/types'
import { ArticleTextParts } from '../article-text-parts/ArticleTextParts'

interface ArticleBlockTextProps {
  block: ArticleBlock
  selectedSenseId: number | null
}

export function ArticleBlockText({ block, selectedSenseId }: ArticleBlockTextProps) {
  const content = <ArticleTextParts block={block} selectedSenseId={selectedSenseId} />

  if (block.type === 'heading') {
    return <h2>{content}</h2>
  }

  return <p>{content}</p>
}
