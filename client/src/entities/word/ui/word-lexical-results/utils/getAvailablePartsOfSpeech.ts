import type { WordInfo } from '../../../model/useWordInfo'

export function getAvailablePartsOfSpeech(wordInfo: WordInfo) {
  const dictionaryParts = wordInfo.dictionary.data
    ?.flatMap((entry) => entry.definitionGroups)
    .map((group) => group.partOfSpeech)
  const translationParts = wordInfo.translation.data?.definitions.map(
    (definition) => definition.partOfSpeech,
  )

  return Array.from(new Set([...(dictionaryParts ?? []), ...(translationParts ?? [])]))
}
