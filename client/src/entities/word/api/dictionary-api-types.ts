import type { DictionaryDefinitionGroup, DictionaryPhonetic } from '../model/lexical-types'

export interface DictionaryApiEntry {
  word: string
  phonetic?: string
  phonetics?: DictionaryPhonetic[]
  meanings: DictionaryDefinitionGroup[]
}
