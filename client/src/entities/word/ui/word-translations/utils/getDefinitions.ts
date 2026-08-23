import type { WordInfo } from '../../../model/useWordInfo'

export function getDefinitions(
  result: WordInfo['translation'],
  partOfSpeech: string | null | undefined,
) {
  const definitions = result.data?.definitions ?? []

  if (partOfSpeech !== undefined) {
    return definitions.filter((definition) => definition.partOfSpeech === partOfSpeech)
  }

  return definitions
}
