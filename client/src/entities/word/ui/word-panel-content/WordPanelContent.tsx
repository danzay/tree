import { useTranslation } from 'react-i18next'
import type { VocabularySense } from '../../model/types'
import type { WordInfo } from '../../model/useWordInfo'
import { WordDetails } from '../word-details/WordDetails'
import styles from './WordPanelContent.module.scss'

interface WordPanelContentProps {
  error: string | null
  wordInfo: WordInfo
  loading: boolean
  sense: VocabularySense | null
}

export function WordPanelContent({ error, loading, wordInfo, sense }: WordPanelContentProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <p className={`${styles.state} ${styles.loading}`} role="status">
        {t('word.panel.loading')}
      </p>
    )
  }

  if (error) {
    return (
      <div className={styles.state} role="alert">
        <strong className={styles.title}>{t('word.panel.errors.title')}</strong>
        <p className={styles.message}>{error}</p>
      </div>
    )
  }

  if (!sense) {
    return null
  }

  return <WordDetails wordInfo={wordInfo} sense={sense} />
}
