import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLibraryItemStore, type LibraryItem } from '@/entities/library-item'
import { useLibraryPageStore } from '../../model/library-page-store'
import { useLibraryPage } from '../../model/use-library-page'
import { LibraryCollection } from '../library-collection/LibraryCollection'
import { LibraryDecorations } from '../library-decorations/LibraryDecorations'
import { LibraryHero } from '../library-hero/LibraryHero'
import { LibraryNotice } from '../library-notice/LibraryNotice'
import { LibraryToolbar } from '../library-toolbar/LibraryToolbar'
import styles from './LibraryPage.module.scss'

export function LibraryPage() {
  const { t } = useTranslation()
  const items = useLibraryItemStore((state) => state.items)
  const view = useLibraryPageStore((state) => state.viewMode)
  const setView = useLibraryPageStore((state) => state.setViewMode)
  const [notice, setNotice] = useState<string | null>(null)
  const page = useLibraryPage(items)

  const openItem = (item: LibraryItem) => {
    setNotice(t('library.messages.openPending', { title: item.title }))
  }

  const openItemMenu = (item: LibraryItem) => {
    setNotice(t('library.messages.menuPending', { title: item.title }))
  }

  const addItem = () => {
    setNotice(t('library.messages.creationPending'))
  }

  const dismissNotice = () => {
    setNotice(null)
  }

  return (
    <section className={styles.page} aria-labelledby="library-title">
      <LibraryHero
        itemsTotal={page.itemsTotal}
        vocabularyTotal={page.vocabularyTotal}
        onAddItem={addItem}
      />
      <LibraryDecorations />
      {notice && <LibraryNotice message={notice} onDismiss={dismissNotice} />}

      <div className={styles.library}>
        <LibraryToolbar
          query={page.query}
          filter={page.filter}
          sort={page.sort}
          view={view}
          onQueryChange={page.setQuery}
          onFilterChange={page.setFilter}
          onSortChange={page.setSort}
          onViewChange={setView}
        />
        <LibraryCollection
          items={page.visibleItems}
          view={view}
          onOpenItem={openItem}
          onOpenItemMenu={openItemMenu}
        />
      </div>
    </section>
  )
}
