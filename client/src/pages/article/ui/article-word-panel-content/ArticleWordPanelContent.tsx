import type { VocabularySense } from '@/entities/word-sense'
import { ArticleWordDetails } from '../article-word-details/ArticleWordDetails'
import { ArticleWordPanelError } from '../article-word-panel-error/ArticleWordPanelError'
import { ArticleWordPanelLoading } from '../article-word-panel-loading/ArticleWordPanelLoading'

interface ArticleWordPanelContentProps {
  error: string | null
  loading: boolean
  sense: VocabularySense | null
}

export function ArticleWordPanelContent({ error, loading, sense }: ArticleWordPanelContentProps) {
  if (loading) {
    return <ArticleWordPanelLoading />
  }

  if (error) {
    return <ArticleWordPanelError error={error} />
  }

  if (!sense) {
    return null
  }

  return <ArticleWordDetails sense={sense} />
}
