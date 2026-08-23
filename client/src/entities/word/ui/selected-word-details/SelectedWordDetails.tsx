import { useTranslation } from 'react-i18next'
import type { WordInfo } from '../../model/useWordInfo'
import { WordLexicalResults } from '../word-lexical-results/WordLexicalResults'
import { WordPronunciation } from '../word-pronunciation/WordPronunciation'
import styles from './SelectedWordDetails.module.scss'

interface SelectedWordDetailsProps {
  wordInfo: WordInfo
  text: string
}

export function SelectedWordDetails({ wordInfo, text }: SelectedWordDetailsProps) {
  const { t } = useTranslation()

  return (
    <div className={styles.content}>
      <p className={styles.eyebrow}>{t('word.selectedWord.eyebrow')}</p>
      <h2>{t('word.selectedWord.title', { text })}</h2>
      <WordPronunciation entries={wordInfo.dictionary.data} />
      <WordLexicalResults wordInfo={wordInfo} />
    </div>
  )
}
