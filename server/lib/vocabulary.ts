import { z } from 'zod'

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const
export const PROGRESS_STATUSES = [
  'new',
  'learning',
  'reviewing',
  'learned',
  'known',
  'suspended',
] as const

export const PART_OF_SPEECH_CODES = [
  'noun',
  'verb',
  'adjective',
  'adverb',
  'pronoun',
  'preposition',
  'conjunction',
  'greeting',
  'article',
  'numeral',
  'expression',
  'participle',
] as const

export const CEFR_LEVEL_SCHEMA = z.enum(CEFR_LEVELS)
export const PROGRESS_STATUS_SCHEMA = z.enum(PROGRESS_STATUSES)
export const PART_OF_SPEECH_SCHEMA = z.enum(PART_OF_SPEECH_CODES)

export type ImportedStatus = 'new' | 'learning' | 'learned' | 'known'

export interface SchedulingFields {
  qRec: number
  qRep: number
  sRec: number
  sRep: number
  eRec: number
  eRep: number
}

export function inferImportedStatus(fields: SchedulingFields): ImportedStatus {
  if (fields.qRec === 0 && fields.qRep === 0) {
    return 'new'
  }

  if (fields.sRec > 0 || fields.sRep > 0) {
    return 'learning'
  }

  if (fields.eRec > 2.5 || fields.eRep > 2.5) {
    return 'learned'
  }

  if (fields.eRec === 2.5 && fields.eRep === 2.5) {
    return 'known'
  }

  throw new Error('Source scheduling fields do not match a supported status')
}

export function normalizeHeadword(word: string): string {
  return word.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en')
}

export const SOURCE_POS_BITS = [
  [1, 'noun'],
  [2, 'verb'],
  [4, 'adjective'],
  [8, 'adverb'],
  [16, 'pronoun'],
  [32, 'preposition'],
  [64, 'conjunction'],
  [128, 'greeting'],
  [256, 'article'],
  [512, 'numeral'],
  [1024, 'expression'],
  [2048, 'participle'],
] as const

export function decodePartOfSpeech(sourceCode: number | null): {
  codes: string[]
  unknownBits: number
} {
  if (sourceCode === null || sourceCode <= 0) {
    return { codes: [], unknownBits: 0 }
  }

  const codes = SOURCE_POS_BITS.filter(([bit]) => (sourceCode & bit) === bit).map(
    ([, code]) => code,
  )
  const knownMask = SOURCE_POS_BITS.reduce((mask, [bit]) => mask | bit, 0)

  return { codes, unknownBits: sourceCode & ~knownMask }
}

const EXAMPLE_SCHEMA = z.object({
  o: z.string().trim().min(1),
  t: z.string().trim().optional().default(''),
})

export type ImportedExample = z.infer<typeof EXAMPLE_SCHEMA>

export function parseExamples(raw: string | null): ImportedExample[] {
  if (!raw?.trim()) {
    return []
  }

  return z.array(EXAMPLE_SCHEMA).parse(JSON.parse(raw))
}
