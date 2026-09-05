import { useTranslation } from 'react-i18next'
import { WordSenseCard, type VocabularySense, type WordsResponse } from '@/entities/word'
import styles from './VocabularyResults.module.scss'

interface VocabularyResultsProps {
  words: WordsResponse
  loading: boolean
  error: string | null
  selectedSenseId: number | null
  onWordSelect: (sense: VocabularySense) => void
}

export function VocabularyResults({
  words,
  loading,
  error,
  selectedSenseId,
  onWordSelect,
}: VocabularyResultsProps) {
  const { t } = useTranslation()
  const matchesLabel = t('vocabulary.results.matches', { count: words.total })
  const hasNoItems = words.items.length === 0
  const hasError = Boolean(error)
  const isSettled = !loading && !hasError
  const isEmpty = isSettled && hasNoItems

  return (
    <>
      <div className={styles.heading}>
        <h2>{t('vocabulary.results.title')}</h2>
        <span>{matchesLabel}</span>
      </div>

      {hasError && (
        <p className={`${styles.message} ${styles.error}`} role="alert">
          {error}
        </p>
      )}
      {loading && <p className={styles.message}>{t('vocabulary.results.loading')}</p>}
      {isEmpty && <p className={styles.message}>{t('vocabulary.results.empty')}</p>}

      <section className={styles.list} aria-live="polite">
        {words.items.map((sense) => {
          const isSelected = Number(sense.id) === selectedSenseId

          return (
            <WordSenseCard
              isSelected={isSelected}
              sense={sense}
              onSelect={onWordSelect}
              key={sense.id}
            />
          )
        })}
      </section>
    </>
  )
}
