import { useTranslation } from 'react-i18next'
import type { VocabularySense } from '../../model/types'
import { NEEDS_REVIEW_STATUS, PART_OF_SPEECH_SEPARATOR } from './consts'
import styles from './WordSenseCard.module.scss'

interface WordSenseCardProps {
  sense: VocabularySense
}

export function WordSenseCard({ sense }: WordSenseCardProps) {
  const { t } = useTranslation()
  const transcription = sense.transcription || t('dictionary.card.noTranscription')
  const translation = sense.translations[0]?.text || t('dictionary.card.translationReview')
  const definition = sense.definition || t('dictionary.card.noDefinition')
  const partOfSpeech =
    sense.partsOfSpeech.join(PART_OF_SPEECH_SEPARATOR) || t('dictionary.card.unknownPartOfSpeech')
  const statusClassName = `${styles.status} ${styles[sense.status] ?? ''}`
  const statusLabel = t(`dictionary.status.${sense.status}`, { defaultValue: sense.status })
  const needsReview = sense.reviewStatus === NEEDS_REVIEW_STATUS

  return (
    <article className={styles.card}>
      <div className={styles.title}>
        <div>
          <h3>{sense.word}</h3>
          <p>{transcription}</p>
        </div>
        <span className={styles.level}>{sense.level}</span>
      </div>
      <p className={styles.translation}>{translation}</p>
      <p className={styles.definition}>{definition}</p>
      <footer>
        <span>{partOfSpeech}</span>
        <span className={statusClassName}>{statusLabel}</span>
        {needsReview && <span className={styles.review}>{t('dictionary.card.needsReview')}</span>}
      </footer>
    </article>
  )
}
