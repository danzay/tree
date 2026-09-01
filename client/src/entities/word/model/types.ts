export type {
  CatalogueLevelResponse as CatalogueLevel,
  LevelProgressResponse as LevelProgress,
  StatsResponse,
  VocabularySenseResponse as VocabularySense,
  WordsResponse,
} from '@/shared/api/generated/api-types'

export interface WordSenseQuery {
  search?: string
  level?: string
  status?: string
  language?: string
  limit?: number
  offset?: number
}
