export const VOCABULARY_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const

export type VocabularyLevel = (typeof VOCABULARY_LEVELS)[number]

export const LEVEL_CLASS_NAMES: Record<VocabularyLevel, string> = {
  A1: 'a1',
  A2: 'a2',
  B1: 'b1',
  B2: 'b2',
  C1: 'c1',
  C2: 'c2',
}
