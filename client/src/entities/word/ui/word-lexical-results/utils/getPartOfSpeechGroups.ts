import type { WordInfo } from '../../../model/useWordInfo'
import { UNKNOWN_PART_OF_SPEECH_KEY } from '../consts'
import type { PartOfSpeechGroup } from '../types'
import { getAvailablePartsOfSpeech } from './getAvailablePartsOfSpeech'
import { getVisiblePartsOfSpeech } from './getVisiblePartsOfSpeech'

export function getPartOfSpeechGroups(
  wordInfo: WordInfo,
  partOfSpeechHints: string[],
  unknownLabel: string,
): PartOfSpeechGroup[] {
  const availableParts = getAvailablePartsOfSpeech(wordInfo)
  const visibleParts = getVisiblePartsOfSpeech(availableParts, partOfSpeechHints)

  return visibleParts.map((partOfSpeech) => ({
    id: partOfSpeech ?? UNKNOWN_PART_OF_SPEECH_KEY,
    label: partOfSpeech ?? unknownLabel,
    partOfSpeech,
  }))
}
