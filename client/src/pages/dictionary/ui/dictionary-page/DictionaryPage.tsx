import { useDictionaryPage } from '../../model/use-dictionary-page'
import { DictionaryFilters } from '../dictionary-filters/DictionaryFilters'
import { DictionaryHeader } from '../dictionary-header/DictionaryHeader'
import { DictionaryPagination } from '../dictionary-pagination/DictionaryPagination'
import { DictionaryResults } from '../dictionary-results/DictionaryResults'
import styles from './DictionaryPage.module.scss'

export function DictionaryPage() {
  const page = useDictionaryPage()
  const paginationIsDisabled = page.loading || Boolean(page.error)

  return (
    <div className={styles.page}>
      <DictionaryHeader />
      <DictionaryFilters
        search={page.search}
        level={page.level}
        status={page.status}
        onSearchChange={page.setSearch}
        onLevelChange={page.setLevel}
        onStatusChange={page.setStatus}
      />
      <DictionaryResults words={page.words} loading={page.loading} error={page.error} />
      <DictionaryPagination
        disabled={paginationIsDisabled}
        page={page.page}
        totalPages={page.totalPages}
        onPageChange={page.setPage}
      />
    </div>
  )
}
