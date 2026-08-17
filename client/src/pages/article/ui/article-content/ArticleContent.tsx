import type { ArticleBlock } from '@/entities/library-item'
import { ArticleBlockText } from '../article-block-text/ArticleBlockText'
import styles from './ArticleContent.module.scss'
import { useArticleContentInteractions } from './use-article-content-interactions'

interface ArticleContentProps {
  blocks: ArticleBlock[]
  selectedSenseId: number | null
  onTextSelect: (text: string) => void
  onWordSelect: (senseId: number) => void
}

export function ArticleContent({
  blocks,
  selectedSenseId,
  onTextSelect,
  onWordSelect,
}: ArticleContentProps) {
  const { handleClick, handlePointerUp } = useArticleContentInteractions({
    onTextSelect,
    onWordSelect,
  })

  return (
    <div className={styles.content} onClick={handleClick} onPointerUp={handlePointerUp}>
      {blocks.map((block) => (
        <ArticleBlockText block={block} key={block.position} selectedSenseId={selectedSenseId} />
      ))}
    </div>
  )
}
