import { useTranslation } from 'react-i18next'
import styles from './ProgressHeader.module.scss'

export function ProgressHeader() {
  const { t } = useTranslation()

  return (
    <header className={styles.header}>
      <p>{t('progress.eyebrow')}</p>
      <h1 id="progress-title">{t('progress.title')}</h1>
      <span>{t('progress.description')}</span>
    </header>
  )
}
