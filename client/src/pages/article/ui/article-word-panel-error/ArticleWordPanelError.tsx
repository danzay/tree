import { useTranslation } from 'react-i18next'
import styles from './ArticleWordPanelError.module.scss'

interface ArticleWordPanelErrorProps {
  error: string
}

export function ArticleWordPanelError({ error }: ArticleWordPanelErrorProps) {
  const { t } = useTranslation()

  return (
    <div className={styles.state} role="alert">
      <strong className={styles.title}>{t('article.wordPanel.errors.title')}</strong>
      <p className={styles.message}>{error}</p>
    </div>
  )
}
