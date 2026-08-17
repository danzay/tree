import { useTranslation } from 'react-i18next'
import { useProgressPage } from '../../model/use-progress-page'
import { LevelProgressChart } from '../level-progress-chart/LevelProgressChart'
import { ProgressHeader } from '../progress-header/ProgressHeader'
import { ProgressOverview } from '../progress-overview/ProgressOverview'
import styles from './ProgressPage.module.scss'

export function ProgressPage() {
  const { t } = useTranslation()
  const page = useProgressPage()

  if (page.loading) {
    return (
      <div className={styles.state} role="status">
        {t('progress.loading')}
      </div>
    )
  }

  if (page.error || !page.stats) {
    return (
      <div className={styles.state} role="alert">
        <h1>{t('progress.errors.title')}</h1>
        <p>{page.error ?? t('progress.errors.loading')}</p>
      </div>
    )
  }

  return (
    <section className={styles.page} aria-labelledby="progress-title">
      <ProgressHeader />
      <div className={styles.content}>
        <ProgressOverview
          total={page.overview.total}
          known={page.overview.known}
          leftToLearn={page.overview.leftToLearn}
        />
        <LevelProgressChart levels={page.stats.levelProgress} />
      </div>
    </section>
  )
}
