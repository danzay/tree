import { useTranslation } from 'react-i18next'
import { WordSenseCard, type WordsResponse } from '@/entities/word-sense'
import styles from './DictionaryResults.module.scss'

interface DictionaryResultsProps {
  words: WordsResponse
  loading: boolean
  error: string | null
}

export function DictionaryResults({ words, loading, error }: DictionaryResultsProps) {
  const { t } = useTranslation()
  const matchesLabel = t('dictionary.results.matches', { count: words.total })
  const hasNoItems = words.items.length === 0
  const hasError = Boolean(error)
  const isSettled = !loading && !hasError
  const isEmpty = isSettled && hasNoItems

  return (
    <>
      <div className={styles.heading}>
        <h2>{t('dictionary.results.title')}</h2>
        <span>{matchesLabel}</span>
      </div>

      {hasError && (
        <p className={`${styles.message} ${styles.error}`} role="alert">
          {error}
        </p>
      )}
      {loading && <p className={styles.message}>{t('dictionary.results.loading')}</p>}
      {isEmpty && <p className={styles.message}>{t('dictionary.results.empty')}</p>}

      <section className={styles.list} aria-live="polite">
        {words.items.map((sense) => (
          <WordSenseCard sense={sense} key={sense.id} />
        ))}
      </section>
    </>
  )
}
