import type { WordInfo } from '../../model/useWordInfo'
import { WordDefinitions } from '../word-definitions/WordDefinitions'
import { WordTranslations } from '../word-translations/WordTranslations'

interface WordLexicalContentProps {
  definitionFallback?: string | null
  wordInfo: WordInfo
  partOfSpeech?: string | null
  translationFallback?: string[]
}

export function WordLexicalContent({
  definitionFallback,
  wordInfo,
  partOfSpeech,
  translationFallback,
}: WordLexicalContentProps) {
  return (
    <>
      <WordDefinitions
        fallback={definitionFallback}
        partOfSpeech={partOfSpeech}
        result={wordInfo.dictionary}
      />
      <WordTranslations
        fallback={translationFallback}
        partOfSpeech={partOfSpeech}
        result={wordInfo.translation}
      />
    </>
  )
}
