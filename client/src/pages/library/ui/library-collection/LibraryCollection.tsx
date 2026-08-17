import { useTranslation } from 'react-i18next'
import { LibraryItemCard, type LibraryItem } from '@/entities/library-item'
import type { LibraryViewMode } from '../../model/library-page-store'
import styles from './LibraryCollection.module.scss'

interface LibraryCollectionProps {
  error: string | null
  items: LibraryItem[]
  loading: boolean
  view: LibraryViewMode
  onOpenItem: (item: LibraryItem) => void
  onOpenItemMenu: (item: LibraryItem) => void
}

export function LibraryCollection({
  error,
  items,
  loading,
  view,
  onOpenItem,
  onOpenItemMenu,
}: LibraryCollectionProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className={styles.empty} role="status">
        <p>{t('library.loading')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.empty} role="alert">
        <h2>{t('library.errors.title')}</h2>
        <p>{error}</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <h2>{t('library.empty.title')}</h2>
        <p>{t('library.empty.description')}</p>
      </div>
    )
  }

  const isListView = view === 'list'
  const listClassName = isListView ? `${styles.list} ${styles.listView}` : styles.list

  return (
    <div className={listClassName} aria-live="polite">
      {items.map((item) => (
        <LibraryItemCard
          item={item}
          layout={view}
          onOpen={onOpenItem}
          onOpenMenu={onOpenItemMenu}
          key={item.id}
        />
      ))}
    </div>
  )
}
