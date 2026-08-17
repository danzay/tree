import { useTranslation } from 'react-i18next'
import styles from './ArticleWordCollocations.module.scss'

interface ArticleWordCollocationsProps {
  collocations: string[]
}

export function ArticleWordCollocations({ collocations }: ArticleWordCollocationsProps) {
  const { t } = useTranslation()

  if (collocations.length === 0) {
    return null
  }

  return (
    <section className={styles.section}>
      <h3 className={styles.title}>{t('article.wordPanel.collocations')}</h3>
      <ul className={styles.list}>
        {collocations.map((collocation) => (
          <li key={collocation}>{collocation}</li>
        ))}
      </ul>
    </section>
  )
}
