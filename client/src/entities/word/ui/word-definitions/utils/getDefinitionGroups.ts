import type { WordInfo } from '../../../model/useWordInfo'

export function getDefinitionGroups(
  result: WordInfo['dictionary'],
  partOfSpeech: string | null | undefined,
) {
  const definitionGroups = result.data?.flatMap((entry) => entry.definitionGroups) ?? []

  if (partOfSpeech !== undefined) {
    return definitionGroups.filter((group) => group.partOfSpeech === partOfSpeech)
  }

  return definitionGroups
}
