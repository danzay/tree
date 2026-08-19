import { useTranslation } from 'react-i18next'
import { LEVEL_CLASS_NAMES, type ArticleHighlightLevel } from '@/entities/library-item'
import type { VocabularySense } from '@/entities/word-sense'
import { ArticleWordCollocations } from '../article-word-collocations/ArticleWordCollocations'
import { PART_OF_SPEECH_SEPARATOR } from './consts'
import styles from './ArticleWordDetails.module.scss'

interface ArticleWordDetailsProps {
  sense: VocabularySense
}

export function ArticleWordDetails({ sense }: ArticleWordDetailsProps) {
  const { t } = useTranslation()
  const transcription = sense.transcription || t('dictionary.card.noTranscription')
  const translation = sense.translations[0]?.text || t('dictionary.card.translationReview')
  const definition = sense.definition || t('dictionary.card.noDefinition')
  const partOfSpeech =
    sense.partsOfSpeech.join(PART_OF_SPEECH_SEPARATOR) || t('dictionary.card.unknownPartOfSpeech')
  const statusLabel = t(`dictionary.status.${sense.status}`, { defaultValue: sense.status })
  const levelClassName =
    LEVEL_CLASS_NAMES[sense.level as ArticleHighlightLevel] ?? LEVEL_CLASS_NAMES.C1

  return (
    <div className={styles.details}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>{sense.word}</h2>
          <p className={styles.transcription}>{transcription}</p>
        </div>
        <span className={`${styles.level} ${styles[levelClassName]}`}>{sense.level}</span>
      </header>
      <div className={styles.tags}>
        <span className={styles.tag}>{partOfSpeech}</span>
        <span className={styles.tag}>{statusLabel}</span>
      </div>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('article.wordPanel.translation')}</h3>
        <p className={styles.sectionText}>{translation}</p>
      </section>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('article.wordPanel.definition')}</h3>
        <p className={styles.sectionText}>{definition}</p>
      </section>
      <ArticleWordCollocations collocations={sense.collocations} />
    </div>
  )
}
