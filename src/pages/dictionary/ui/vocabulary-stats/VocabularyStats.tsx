import { useTranslation } from 'react-i18next'
import type { StatsResponse } from '@/entities/word-sense'
import styles from './VocabularyStats.module.scss'

interface VocabularyStatsProps {
  stats: StatsResponse
}

export function VocabularyStats({ stats }: VocabularyStatsProps) {
  const { t } = useTranslation()

  return (
    <section className={styles.stats} aria-label={t('dictionary.stats.label')}>
      <div>
        <strong>{stats.senses.toLocaleString()}</strong>
        <span>{t('dictionary.stats.senses')}</span>
      </div>
      <div>
        <strong>{stats.headwords.toLocaleString()}</strong>
        <span>{t('dictionary.stats.headwords')}</span>
      </div>
      <div>
        <strong>{(stats.reconciliation.official_gap ?? 0).toLocaleString()}</strong>
        <span>{t('dictionary.stats.officialGaps')}</span>
      </div>
    </section>
  )
}
