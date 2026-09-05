import { useVocabularyPage } from '../../model/use-vocabulary-page'
import { VocabularyFilters } from '../vocabulary-filters/VocabularyFilters'
import { VocabularyHeader } from '../vocabulary-header/VocabularyHeader'
import { VocabularyPagination } from '../vocabulary-pagination/VocabularyPagination'
import { VocabularyResults } from '../vocabulary-results/VocabularyResults'
import { VocabularySearch } from '../vocabulary-search/VocabularySearch'
import { VocabularyWordPanel } from '../vocabulary-word-panel/VocabularyWordPanel'
import styles from './VocabularyPage.module.scss'

export function VocabularyPage() {
  const page = useVocabularyPage()
  const paginationIsDisabled = page.loading || Boolean(page.error)
  const hasSelectedWord = page.selectedSenseId !== null

  return (
    <div className={styles.page}>
      <VocabularyHeader />
      <VocabularySearch value={page.search} onChange={page.setSearch} />
      <VocabularyFilters
        level={page.level}
        pageSize={page.pageSize}
        status={page.status}
        onLevelChange={page.setLevel}
        onPageSizeChange={page.setPageSize}
        onStatusChange={page.setStatus}
      />
      <div className={styles.layout}>
        <div className={styles.results}>
          <VocabularyResults
            words={page.words}
            loading={page.loading}
            error={page.error}
            selectedSenseId={page.selectedSenseId}
            onWordSelect={page.selectWord}
          />
          <VocabularyPagination
            disabled={paginationIsDisabled}
            page={page.page}
            totalPages={page.totalPages}
            onPageChange={page.setPage}
          />
        </div>
        <div className={styles.details} data-active={hasSelectedWord || undefined}>
          {hasSelectedWord && (
            <VocabularyWordPanel
              error={page.selectedWord.error}
              loading={page.selectedWord.loading}
              sense={page.selectedWord.sense}
              wordInfo={page.wordInfo}
              onClose={page.closeWord}
            />
          )}
        </div>
      </div>
    </div>
  )
}
