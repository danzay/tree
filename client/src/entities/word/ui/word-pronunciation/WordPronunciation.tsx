import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from 'react-aria-components'
import type { DictionaryEntry } from '../../model/lexical-types'
import { SpeakerIcon } from './SpeakerIcon'
import { getPronunciation } from './utils/getPronunciation'
import styles from './WordPronunciation.module.scss'

interface WordPronunciationProps {
  entries: DictionaryEntry[] | null
  fallbackTranscription?: string | null
  missingTranscriptionLabel?: string
}

export function WordPronunciation({
  entries = [],
  fallbackTranscription,
  missingTranscriptionLabel,
}: WordPronunciationProps) {
  const { t } = useTranslation()
  const audioRef = useRef<HTMLAudioElement>(null)
  const pronunciation = getPronunciation(entries ?? [])
  const transcription =
    fallbackTranscription ?? pronunciation.transcription ?? missingTranscriptionLabel
  const withAudio = Boolean(pronunciation.audioUrl)
  const withPronunciation = Boolean(transcription || withAudio)
  const handlePlay = () => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    audio.currentTime = 0
    void audio.play().catch(() => undefined)
  }

  if (!withPronunciation) {
    return null
  }

  return (
    <div className={styles.pronunciation}>
      {transcription && <p>{transcription}</p>}
      {withAudio && (
        <>
          <Button
            className={styles.play}
            aria-label={t('word.lexical.playPronunciation')}
            onPress={handlePlay}
          >
            <SpeakerIcon />
          </Button>
          {/* A pronunciation clip contains no speech content that can be meaningfully captioned. */}
          {/* eslint-disable-next-line jsx-a11y-x/media-has-caption */}
          <audio ref={audioRef} src={pronunciation.audioUrl} preload="none" />
        </>
      )}
    </div>
  )
}
