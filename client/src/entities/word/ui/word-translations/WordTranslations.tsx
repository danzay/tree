import { useTranslation } from 'react-i18next'
import type { TranslationDefinition } from '../../model/lexical-types'
import type { WordInfo } from '../../model/useWordInfo'
import { WordTranslationGroup } from '../word-translation-group/WordTranslationGroup'
import { getDefinitions } from './utils/getDefinitions'
import styles from './WordTranslations.module.scss'

interface WordTranslationsProps {
  fallback?: string[]
  partOfSpeech?: string | null
  result: WordInfo['translation']
}

export function WordTranslations({ fallback = [], partOfSpeech, result }: WordTranslationsProps) {
  const { t } = useTranslation()
  const definitions: TranslationDefinition[] = getDefinitions(result, partOfSpeech)
  const withDefinitions = definitions.length > 0
  const withFallback = fallback.length > 0

  if (withDefinitions) {
    return (
      <section className={styles.section}>
        <h3>{t('word.panel.translation')}</h3>
        <div className={styles.results}>
          {definitions.map((definition, index) => (
            <WordTranslationGroup
              definition={definition}
              key={`${definition.partOfSpeech}-${index}`}
            />
          ))}
        </div>
      </section>
    )
  }

  if (withFallback) {
    return (
      <section className={styles.section}>
        <h3>{t('word.panel.translation')}</h3>
        <p>{fallback.join('; ')}</p>
      </section>
    )
  }

  if (result.loading) {
    return <p className={styles.state}>{t('word.lexical.loadingTranslation')}</p>
  }

  if (result.error) {
    return <p className={styles.state}>{result.error}</p>
  }

  return <p className={styles.state}>{t('word.lexical.noTranslation')}</p>
}
