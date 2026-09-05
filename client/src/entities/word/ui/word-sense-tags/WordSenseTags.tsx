import { useTranslation } from 'react-i18next'
import { LEVEL_CLASS_NAMES } from '@/shared/model/vocabulary-level'
import type { VocabularySense } from '../../model/types'
import { WordStatusControl } from '../word-status-control/WordStatusControl'
import { NEEDS_REVIEW_STATUS } from './consts'
import styles from './WordSenseTags.module.scss'

interface WordSenseTagsProps {
  sense: VocabularySense
}

export function WordSenseTags({ sense }: WordSenseTagsProps) {
  const { t } = useTranslation()
  const levelClassName = LEVEL_CLASS_NAMES[sense.level]
  const partsOfSpeech =
    sense.partsOfSpeech.length > 0
      ? sense.partsOfSpeech
      : [t('word.card.unknownPartOfSpeech')]
  const needsReview = sense.reviewStatus === NEEDS_REVIEW_STATUS

  return (
    <div className={styles.row}>
      <div className={styles.tags}>
        <span className={`${styles.tag} ${styles.level} ${styles[levelClassName]}`}>
          {sense.level}
        </span>
        {partsOfSpeech.map((partOfSpeech) => (
          <span className={styles.tag} key={partOfSpeech}>
            {partOfSpeech}
          </span>
        ))}
        {needsReview && (
          <span className={`${styles.tag} ${styles.review}`}>
            {t('word.card.needsReview')}
          </span>
        )}
      </div>
      <WordStatusControl senseId={sense.id} status={sense.status} />
    </div>
  )
}
