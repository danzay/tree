import { useTranslation } from 'react-i18next'
import styles from './DictionaryHeader.module.scss'

export function DictionaryHeader() {
  const { t } = useTranslation()

  return (
    <header className={styles.header}>
      <p className={styles.eyebrow}>{t('dictionary.header.eyebrow')}</p>
      <h1>{t('dictionary.header.title')}</h1>
      <p className={styles.intro}>{t('dictionary.header.description')}</p>
    </header>
  )
}
