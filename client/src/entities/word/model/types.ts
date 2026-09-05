import type { LearningStatus as LearningStatusValue } from '@/shared/api/generated/api-types'

export { LearningStatus } from '@/shared/api/generated/api-types'
export type {
  CatalogueLevelResponse as CatalogueLevel,
  LevelProgressResponse as LevelProgress,
  StatsResponse,
  UpdateWordStatusRequest,
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

export interface UpdateWordStatusVariables {
  id: string
  status: LearningStatusValue
}
