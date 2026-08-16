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

export function normalizeHeadword(word: string): string {
  return word.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en')
}
