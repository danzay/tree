import { useTranslation } from 'react-i18next'
import styles from './VocabularyHeader.module.scss'

export function VocabularyHeader() {
  const { t } = useTranslation()

  return (
    <header className={styles.header}>
      <h1>{t('vocabulary.header.title')}</h1>
      <p className={styles.intro}>{t('vocabulary.header.description')}</p>
    </header>
  )
}
