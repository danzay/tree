import type { DictionaryEntry } from '../../../model/lexical-types'

export function getPronunciation(entries: DictionaryEntry[]) {
  const phonetics = entries.flatMap((entry) => entry.phonetics ?? [])
  const transcription = entries.find((entry) => entry.phonetic)?.phonetic
  const phoneticTranscription = phonetics.find((phonetic) => phonetic.text)?.text
  const audioUrl = phonetics.find((phonetic) => phonetic.audio)?.audio

  return {
    audioUrl,
    transcription: transcription ?? phoneticTranscription,
  }
}
