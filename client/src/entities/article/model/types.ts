import type { LibraryItem } from '@/entities/library-item'
import type { VocabularyLevel } from '@/shared/model/vocabulary-level'

export interface ArticleBlock {
  position: number
  type: 'heading' | 'paragraph'
  text: string
  highlights: ArticleHighlight[]
}

export interface ArticleHighlight {
  start: number
  end: number
  senseId: number
  word: string
  level: VocabularyLevel
  status: 'new' | 'learning'
}

export interface ArticleDetail {
  item: LibraryItem
  blocks: ArticleBlock[]
}
