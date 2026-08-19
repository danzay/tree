import { LIBRARY_ITEM_READING_STATUSES, LIBRARY_ITEM_TYPES } from './consts'

export type LibraryItemType = (typeof LIBRARY_ITEM_TYPES)[number]
export type LibraryItemReadingStatus = (typeof LIBRARY_ITEM_READING_STATUSES)[number]

export interface LibraryItem {
  id: number
  slug: string
  title: string
  type: LibraryItemType
  summary: string
  topic: string
  coverImagePath: string
  estimatedReadMinutes: number
  vocabularyCount: number
  readingStatus: LibraryItemReadingStatus
  lastOpenedAt: string | null
  updatedAt: string
}

export interface ArticleBlock {
  position: number
  type: 'heading' | 'paragraph'
  text: string
  highlights: ArticleHighlight[]
}

export type ArticleHighlightLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export interface ArticleHighlight {
  start: number
  end: number
  senseId: number
  word: string
  level: ArticleHighlightLevel
  status: 'new' | 'learning'
}

export interface LibraryItemDetail {
  item: LibraryItem
  blocks: ArticleBlock[]
}
