export interface DictionaryDefinition {
  definition: string
  example?: string
  synonyms: string[]
  antonyms: string[]
}

export interface DictionaryDefinitionGroup {
  partOfSpeech: string
  definitions: DictionaryDefinition[]
  synonyms: string[]
  antonyms: string[]
}

export interface DictionaryPhonetic {
  text?: string
  audio: string
}

export interface DictionaryEntry {
  word: string
  phonetic?: string
  phonetics?: DictionaryPhonetic[]
  definitionGroups: DictionaryDefinitionGroup[]
}

export type {
  TranslationDefinitionResponse as TranslationDefinition,
  TranslationLookupResponse as TranslationResponse,
} from '@/shared/api/generated/api-types'
