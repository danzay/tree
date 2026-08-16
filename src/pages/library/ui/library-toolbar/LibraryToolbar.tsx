import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Input, Label, SearchField } from 'react-aria-components/SearchField'
import searchHandle from '@/assets/library/search-handle.svg'
import searchRing from '@/assets/library/search-ring.svg'
import { SegmentedControl, Select } from '@/shared/ui'
import type { LibraryViewMode } from '../../model/library-page-store'
import type { LibraryFilter, LibrarySort } from '../../model/types'
import { FILTER_OPTIONS, SORT_OPTIONS, VIEW_VALUES } from './consts'
import styles from './LibraryToolbar.module.scss'

function GridIcon() {
  return (
    <span className={styles.gridIcon} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  )
}

function ListIcon() {
  return (
    <span className={styles.listIcon} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  )
}

function getViewIcon(view: LibraryViewMode): ReactNode {
  if (view === 'grid') {
    return <GridIcon />
  }

  return <ListIcon />
}

interface LibraryToolbarProps {
  query: string
  filter: LibraryFilter
  sort: LibrarySort
  view: LibraryViewMode
  onQueryChange: (query: string) => void
  onFilterChange: (filter: LibraryFilter) => void
  onSortChange: (sort: LibrarySort) => void
  onViewChange: (view: LibraryViewMode) => void
}

export function LibraryToolbar({
  query,
  filter,
  sort,
  view,
  onQueryChange,
  onFilterChange,
  onSortChange,
  onViewChange,
}: LibraryToolbarProps) {
  const { t } = useTranslation()
  const filterOptions = FILTER_OPTIONS.map(({ value, translationKey }) => ({
    value,
    label: t(translationKey),
  }))
  const sortOptions = SORT_OPTIONS.map(({ value, translationKey }) => ({
    value,
    label: t(translationKey),
  }))
  const viewOptions = VIEW_VALUES.map((value) => ({
    value,
    ariaLabel: t(`library.view.${value}`),
    label: getViewIcon(value),
  }))

  return (
    <div className={styles.toolbar}>
      <SearchField className={styles.search} value={query} onChange={onQueryChange}>
        <Label className={styles.visuallyHidden}>{t('library.search.label')}</Label>
        <span className={styles.searchIcon} aria-hidden="true">
          <img src={searchRing} alt="" />
          <img src={searchHandle} alt="" />
        </span>
        <Input className={styles.searchInput} placeholder={t('library.search.placeholder')} />
      </SearchField>

      <SegmentedControl
        className={styles.tabs}
        itemClassName={styles.tab}
        value={filter}
        options={filterOptions}
        onValueChange={onFilterChange}
        ariaLabel={t('library.filters.label')}
      />

      <Select
        triggerClassName={styles.sort}
        value={sort}
        options={sortOptions}
        onValueChange={onSortChange}
        label={t('library.sort.label')}
        labelClassName={styles.visuallyHidden}
      />

      <SegmentedControl
        className={styles.viewToggle}
        value={view}
        options={viewOptions}
        onValueChange={onViewChange}
        ariaLabel={t('library.view.label')}
      />
    </div>
  )
}
