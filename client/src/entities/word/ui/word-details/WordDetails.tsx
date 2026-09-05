import { useTranslation } from 'react-i18next'
import type { VocabularySense } from '../../model/types'
import type { WordInfo } from '../../model/useWordInfo'
import { WordCollocations } from '../word-collocations/WordCollocations'
import { WordLexicalResults } from '../word-lexical-results/WordLexicalResults'
import { WordPronunciation } from '../word-pronunciation/WordPronunciation'
import { WordSenseTags } from '../word-sense-tags/WordSenseTags'
import styles from './WordDetails.module.scss'

interface WordDetailsProps {
  wordInfo: WordInfo
  sense: VocabularySense
}

export function WordDetails({ wordInfo, sense }: WordDetailsProps) {
  const { t } = useTranslation()
  const translations = sense.translations.map((translation) => translation.text)

  return (
    <div className={styles.details}>
      <header className={styles.header}>
        <h2 className={styles.title}>{sense.word}</h2>
        <WordPronunciation
          entries={wordInfo.dictionary.data}
          fallbackTranscription={sense.transcription}
          missingTranscriptionLabel={t('word.card.noTranscription')}
        />
      </header>
      <div className={styles.tags}>
        <WordSenseTags sense={sense} />
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
