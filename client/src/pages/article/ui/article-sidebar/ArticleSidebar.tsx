import { ArticleCover } from '@/entities/article'
import type { LibraryItem } from '@/entities/library-item'
import {
  ResponsiveWordPanel,
  SelectedWordDetails,
  WordPanelContent,
  type VocabularySense,
  type WordInfo,
} from '@/entities/word'

interface ArticleSidebarProps {
  item: LibraryItem
  wordInfo: WordInfo
  selectedSenseId: number | null
  selectedText: string | null
  wordError: string | null
  wordLoading: boolean
  wordSense: VocabularySense | null
  onWordClose: () => void
}

export function ArticleSidebar({
  item,
  wordInfo,
  selectedSenseId,
  selectedText,
  wordError,
  wordLoading,
  wordSense,
  onWordClose,
}: ArticleSidebarProps) {
  if (selectedText) {
    return (
      <ResponsiveWordPanel sticky onClose={onWordClose}>
        <SelectedWordDetails wordInfo={wordInfo} text={selectedText} />
      </ResponsiveWordPanel>
    )
  }

  if (selectedSenseId !== null) {
    return (
      <ResponsiveWordPanel sticky onClose={onWordClose}>
        <WordPanelContent
          error={wordError}
          loading={wordLoading}
          wordInfo={wordInfo}
          sense={wordSense}
        />
      </ResponsiveWordPanel>
    )
  }

  return <ArticleCover item={item} />
}
