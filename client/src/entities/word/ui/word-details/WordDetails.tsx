import { useTranslation } from 'react-i18next'
import { LEVEL_CLASS_NAMES } from '@/shared/model/vocabulary-level'
import type { VocabularySense } from '../../model/types'
import type { WordInfo } from '../../model/useWordInfo'
import { WordLexicalResults } from '../word-lexical-results/WordLexicalResults'
import { WordPronunciation } from '../word-pronunciation/WordPronunciation'
import { WordCollocations } from '../word-collocations/WordCollocations'
import styles from './WordDetails.module.scss'

interface WordDetailsProps {
  wordInfo: WordInfo
  sense: VocabularySense
}

export function WordDetails({ wordInfo, sense }: WordDetailsProps) {
  const { t } = useTranslation()
  const translations = sense.translations.map((translation) => translation.text)
  const statusLabel = t(`dictionary.status.${sense.status}`, { defaultValue: sense.status })
  const levelClassName = LEVEL_CLASS_NAMES[sense.level]

  return (
    <div className={styles.details}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>{sense.word}</h2>
          <WordPronunciation
            entries={wordInfo.dictionary.data}
            fallbackTranscription={sense.transcription}
            missingTranscriptionLabel={t('dictionary.card.noTranscription')}
          />
        </div>
        <span className={`${styles.level} ${styles[levelClassName]}`}>{sense.level}</span>
      </header>
      <div className={styles.tags}>
        <span className={styles.tag}>{statusLabel}</span>
      </div>
      <WordLexicalResults
        definitionFallback={sense.definition}
        wordInfo={wordInfo}
        partOfSpeechHints={sense.partsOfSpeech}
        translationFallback={translations}
      />
      <WordCollocations collocations={sense.collocations} />
    </div>
  )
}
