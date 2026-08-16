import { useTranslation } from 'react-i18next'
import styles from './ProgressPage.module.scss'

export function ProgressPage() {
  const { t } = useTranslation()

  return (
    <section className={styles.page} aria-labelledby="progress-title">
      <p className={styles.eyebrow}>{t('progress.eyebrow')}</p>
      <h1 id="progress-title">{t('progress.title')}</h1>
      <p>{t('progress.description')}</p>
    </section>
  )
}
