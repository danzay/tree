import { useTranslation } from 'react-i18next'
import styles from './ProgressHeader.module.scss'

export function ProgressHeader() {
  const { t } = useTranslation()

  return (
    <header className={styles.header}>
      <p>{t('progress.eyebrow')}</p>
      <h3 id="progress-title">{t('progress.title')}</h3>
      <span>{t('progress.description')}</span>
    </header>
  )
}
