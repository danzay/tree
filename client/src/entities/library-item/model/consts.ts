import type { ArticleHighlightLevel } from './types'

export const LIBRARY_ITEM_TYPES = ['article', 'story', 'video', 'podcast', 'note'] as const
export const LIBRARY_ITEM_READING_STATUSES = ['not_started', 'in_progress', 'completed'] as const
export const LEVEL_CLASS_NAMES: Record<ArticleHighlightLevel, string> = {
  A1: 'a1',
  A2: 'a2',
  B1: 'b1',
  B2: 'b2',
  C1: 'c1',
  C2: 'c2',
}
