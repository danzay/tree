export function getVisiblePartsOfSpeech(
  availableParts: Array<string | null>,
  partOfSpeechHints: string[],
) {
  const matchingHints = partOfSpeechHints.filter((hint) => availableParts.includes(hint))

  if (matchingHints.length > 0) {
    return matchingHints
  }

  if (availableParts.length > 0) {
    return availableParts
  }

  return partOfSpeechHints
}
