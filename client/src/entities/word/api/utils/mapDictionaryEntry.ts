import type { DictionaryApiEntry } from '../dictionary-api-types'
import type { DictionaryEntry } from '../../model/lexical-types'

export function mapDictionaryEntry(entry: DictionaryApiEntry): DictionaryEntry {
  return {
    word: entry.word,
    phonetic: entry.phonetic,
    phonetics: entry.phonetics,
    definitionGroups: entry.meanings,
  }
}
