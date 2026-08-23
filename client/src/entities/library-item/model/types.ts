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
