import { useTranslation } from 'react-i18next'
import { HIGHLIGHT_LEVELS } from './consts'
import styles from './ArticleVocabularyLegend.module.scss'

export function ArticleVocabularyLegend() {
  const { t } = useTranslation()

  return (
    <section className={styles.legend} aria-labelledby="vocabulary-legend-title">
      <h2 id="vocabulary-legend-title">{t('article.vocabulary.title')}</h2>
      <p>{t('article.vocabulary.description')}</p>
      <ul>
        {HIGHLIGHT_LEVELS.map((level) => (
          <li key={level}>
            <span className={styles[level.toLocaleLowerCase()]} aria-hidden="true" />
            {level}
          </li>
        ))}
      </ul>
    </section>
  )
}
