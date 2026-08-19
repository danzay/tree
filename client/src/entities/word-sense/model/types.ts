export interface CatalogueLevel {
  source: string
  sourceName: string
  level: string
}

export interface VocabularySense {
  id: string
  word: string
  definition: string | null
  transcription: string | null
  level: string
  reviewStatus: string
  status: string
  partsOfSpeech: string[]
  translations: Array<{ language: string; text: string }>
  collocations: string[]
  catalogueLevels: CatalogueLevel[]
}

export interface WordsResponse {
  items: VocabularySense[]
  total: number
}

export interface StatsResponse {
  senses: number
  headwords: number
  byLevel: Record<string, number>
  byStatus: Record<string, number>
  reconciliation: Record<string, number>
  levelProgress: LevelProgress[]
}

export interface LevelProgress {
  level: string
  total: number
  known: number
  leftToLearn: number
}

export interface WordSenseQuery {
  search?: string
  level?: string
  status?: string
  language?: string
  limit?: number
}
