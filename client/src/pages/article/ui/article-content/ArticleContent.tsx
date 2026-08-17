import type { ArticleBlock } from '@/entities/library-item'
import { ArticleBlockText } from '../article-block-text/ArticleBlockText'
import styles from './ArticleContent.module.scss'

interface ArticleContentProps {
  blocks: ArticleBlock[]
}

export function ArticleContent({ blocks }: ArticleContentProps) {
  return (
    <div className={styles.content}>
      {blocks.map((block) => (
        <ArticleBlockText block={block} key={block.position} />
      ))}
    </div>
  )
}
