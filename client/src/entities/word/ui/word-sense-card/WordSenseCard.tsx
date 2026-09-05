import { useTranslation } from 'react-i18next'
import { Button } from 'react-aria-components'
import { LEVEL_CLASS_NAMES } from '@/shared/model/vocabulary-level'
import type { VocabularySense } from '../../model/types'
import { WordPreviewDecoration } from '../word-preview-decoration/WordPreviewDecoration'
import { WordStatusControl } from '../word-status-control/WordStatusControl'
import { PART_OF_SPEECH_SEPARATOR } from './consts'
import styles from './WordSenseCard.module.scss'

interface WordSenseCardProps {
  isSelected: boolean
  sense: VocabularySense
  onSelect: (sense: VocabularySense) => void
}

export function WordSenseCard({ isSelected, sense, onSelect }: WordSenseCardProps) {
  const { t } = useTranslation()
  const hasTranscription = Boolean(sense.transcription)
  const levelClassName = LEVEL_CLASS_NAMES[sense.level]
  const partOfSpeech =
    sense.partsOfSpeech.join(PART_OF_SPEECH_SEPARATOR) || t('word.card.unknownPartOfSpeech')

  const handleSelect = () => {
    onSelect(sense)
  }

  return (
    <article className={styles.card} data-selected={isSelected || undefined}>
      <Button className={styles.summary} onPress={handleSelect}>
        <span className={styles.heading}>
          <span className={styles.word}>{sense.word}</span>
          {hasTranscription && <span className={styles.transcription}>{sense.transcription}</span>}
        </span>
        <span className={styles.partOfSpeech}>{partOfSpeech}</span>
      </Button>
      <div className={styles.metadata}>
        <span className={`${styles.level} ${styles[levelClassName]}`}>{sense.level}</span>
        <WordStatusControl senseId={sense.id} status={sense.status} />
      </div>
      <WordPreviewDecoration />
    </article>
  )
}
