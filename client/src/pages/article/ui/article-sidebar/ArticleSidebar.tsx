import type { LibraryItem } from '@/entities/library-item'
import type { VocabularySense } from '@/entities/word-sense'
import { ArticleCover } from '../article-cover/ArticleCover'
import { ArticleSelectionDetails } from '../article-selection-details/ArticleSelectionDetails'
import { ArticleWordPanel } from '../article-word-panel/ArticleWordPanel'
import { ArticleWordPanelContent } from '../article-word-panel-content/ArticleWordPanelContent'

interface ArticleSidebarProps {
  item: LibraryItem
  selectedSenseId: number | null
  selectedText: string | null
  wordError: string | null
  wordLoading: boolean
  wordSense: VocabularySense | null
  onWordClose: () => void
}

export function ArticleSidebar({
  item,
  selectedSenseId,
  selectedText,
  wordError,
  wordLoading,
  wordSense,
  onWordClose,
}: ArticleSidebarProps) {
  if (selectedText) {
    return (
      <ArticleWordPanel onClose={onWordClose}>
        <ArticleSelectionDetails text={selectedText} />
      </ArticleWordPanel>
    )
  }

  if (selectedSenseId !== null) {
    return (
      <ArticleWordPanel onClose={onWordClose}>
        <ArticleWordPanelContent error={wordError} loading={wordLoading} sense={wordSense} />
      </ArticleWordPanel>
    )
  }

  return <ArticleCover item={item} />
}
