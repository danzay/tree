import { useTranslation } from 'react-i18next'
import type { LibraryItem } from '@/entities/library-item'
import styles from './ArticleHeader.module.scss'

interface ArticleHeaderProps {
  item: LibraryItem
}

export function ArticleHeader({ item }: ArticleHeaderProps) {
  const { t } = useTranslation()

  return (
    <header className={styles.header}>
      <span className={styles.type}>{t(`libraryItem.type.${item.type}`)}</span>
      <h1>{item.title}</h1>
      <p className={styles.summary}>{item.summary}</p>
      <div className={styles.metadata}>
        <span>{item.topic}</span>
        <span aria-hidden="true">·</span>
        <span>{t('libraryItem.readTime', { count: item.estimatedReadMinutes })}</span>
      </div>
    </header>
  )
}
