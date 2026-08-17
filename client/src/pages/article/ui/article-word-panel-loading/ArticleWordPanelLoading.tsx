import { useTranslation } from 'react-i18next'
import styles from './ArticleWordPanelLoading.module.scss'

export function ArticleWordPanelLoading() {
  const { t } = useTranslation()

  return (
    <p className={styles.state} role="status">
      {t('article.wordPanel.loading')}
    </p>
  )
}
