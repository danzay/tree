import {
  ResponsiveWordPanel,
  WordPanelContent,
  type VocabularySense,
  type WordInfo,
} from '@/entities/word'

interface VocabularyWordPanelProps {
  error: string | null
  loading: boolean
  sense: VocabularySense | null
  wordInfo: WordInfo
  onClose: () => void
}

export function VocabularyWordPanel({
  error,
  loading,
  sense,
  wordInfo,
  onClose,
}: VocabularyWordPanelProps) {
  return (
    <ResponsiveWordPanel sticky onClose={onClose}>
      <WordPanelContent error={error} loading={loading} sense={sense} wordInfo={wordInfo} />
    </ResponsiveWordPanel>
  )
}
