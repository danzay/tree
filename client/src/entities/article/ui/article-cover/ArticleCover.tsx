import { useTranslation } from 'react-i18next'
import type { LibraryItem } from '@/entities/library-item'
import { ArticleVocabularyLegend } from '../article-vocabulary-legend/ArticleVocabularyLegend'
import styles from './ArticleCover.module.scss'

interface ArticleCoverProps {
  item: LibraryItem
}

export function ArticleCover({ item }: ArticleCoverProps) {
  const { t } = useTranslation()

  return (
    <aside className={styles.coverCard}>
      <img src={item.coverImagePath} alt={t('libraryItem.coverAlt', { title: item.title })} />
      <div>
        <span>{t('article.about.topic')}</span>
        <strong>{item.topic}</strong>
      </div>
      <ArticleVocabularyLegend />
    </aside>
  )
}
