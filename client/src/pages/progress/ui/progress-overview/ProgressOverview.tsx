import { useTranslation } from 'react-i18next'
import styles from './ProgressOverview.module.scss'

interface ProgressOverviewProps {
  total: number
  known: number
  leftToLearn: number
}

function percentage(known: number, total: number) {
  if (total === 0) {
    return 0
  }

  return Math.round((known / total) * 100)
}

export function ProgressOverview({ total, known, leftToLearn }: ProgressOverviewProps) {
  const { t } = useTranslation()
  const completedPercentage = percentage(known, total)
  const completedPercentageLabel = `${completedPercentage}%`
  const progressMaximum = Math.max(total, 1)

  return (
    <section className={styles.card} aria-labelledby="overall-progress-title">
      <div className={styles.heading}>
        <div>
          <p>{t('progress.overview.eyebrow')}</p>
          <h2 id="overall-progress-title">{t('progress.overview.title')}</h2>
        </div>
        <strong>{completedPercentageLabel}</strong>
      </div>

      <progress
        className={styles.progress}
        value={known}
        max={progressMaximum}
        aria-label={t('progress.overview.progressLabel')}
      />

      <dl className={styles.metrics}>
        <div>
          <dt>{t('progress.overview.total')}</dt>
          <dd>{total.toLocaleString()}</dd>
        </div>
        <div>
          <dt>{t('progress.overview.known')}</dt>
          <dd>{known.toLocaleString()}</dd>
        </div>
        <div>
          <dt>{t('progress.overview.left')}</dt>
          <dd>{leftToLearn.toLocaleString()}</dd>
        </div>
      </dl>
    </section>
  )
}
