import { useTranslation } from 'react-i18next'
import styles from './ArticleSelectionDetails.module.scss'

interface ArticleSelectionDetailsProps {
  text: string
}

export function ArticleSelectionDetails({ text }: ArticleSelectionDetailsProps) {
  const { t } = useTranslation()

  return (
    <div className={styles.content}>
      <p className={styles.eyebrow}>{t('article.selectionPanel.eyebrow')}</p>
      <h2>{t('article.selectionPanel.title', { text })}</h2>
      <p className={styles.message}>{t('article.selectionPanel.message')}</p>
    </div>
  )
}
