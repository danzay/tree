import { useDictionaryPage } from '../../model/use-dictionary-page'
import { DictionaryFilters } from '../dictionary-filters/DictionaryFilters'
import { DictionaryHeader } from '../dictionary-header/DictionaryHeader'
import { DictionaryResults } from '../dictionary-results/DictionaryResults'
import { VocabularyStats } from '../vocabulary-stats/VocabularyStats'
import styles from './DictionaryPage.module.scss'

export function DictionaryPage() {
  const page = useDictionaryPage()

  return (
    <div className={styles.page}>
      <DictionaryHeader />
      {page.stats && <VocabularyStats stats={page.stats} />}
      <DictionaryFilters
        search={page.search}
        level={page.level}
        status={page.status}
        onSearchChange={page.setSearch}
        onLevelChange={page.setLevel}
        onStatusChange={page.setStatus}
      />
      <DictionaryResults words={page.words} loading={page.loading} error={page.error} />
    </div>
  )
}
