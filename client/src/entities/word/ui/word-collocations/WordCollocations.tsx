import { useTranslation } from 'react-i18next'
import styles from './WordCollocations.module.scss'

interface WordCollocationsProps {
  collocations: string[]
}

export function WordCollocations({ collocations }: WordCollocationsProps) {
  const { t } = useTranslation()

  if (collocations.length === 0) {
    return null
  }

  return (
    <section className={styles.section}>
      <h3 className={styles.title}>{t('word.panel.collocations')}</h3>
      <ul className={styles.list}>
        {collocations.map((collocation) => (
          <li key={collocation}>{collocation}</li>
        ))}
      </ul>
    </section>
  )
}
