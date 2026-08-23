import { useTranslation } from 'react-i18next'
import type { DictionaryDefinitionGroup } from '../../model/lexical-types'
import type { WordInfo } from '../../model/useWordInfo'
import { WordDefinitionGroup } from '../word-definition-group/WordDefinitionGroup'
import { getDefinitionGroups } from './utils/getDefinitionGroups'
import styles from './WordDefinitions.module.scss'

interface WordDefinitionsProps {
  fallback?: string | null
  partOfSpeech?: string | null
  result: WordInfo['dictionary']
}

export function WordDefinitions({ fallback, partOfSpeech, result }: WordDefinitionsProps) {
  const { t } = useTranslation()
  const definitionGroups: DictionaryDefinitionGroup[] = getDefinitionGroups(result, partOfSpeech)
  const withDefinitionGroups = definitionGroups.length > 0
  const withFallback = Boolean(fallback)

  if (withDefinitionGroups) {
    return (
      <section className={styles.section}>
        <h3>{t('word.panel.definition')}</h3>
        <div className={styles.results}>
          {definitionGroups.map((group, index) => (
            <WordDefinitionGroup
              group={group}
              key={`${group.partOfSpeech}-${group.definitions[0]?.definition}-${index}`}
            />
          ))}
        </div>
      </section>
    )
  }

  if (withFallback) {
    return (
      <section className={styles.section}>
        <h3>{t('word.panel.definition')}</h3>
        <p>{fallback}</p>
      </section>
    )
  }

  if (result.loading) {
    return <p className={styles.state}>{t('word.lexical.loadingDefinition')}</p>
  }

  if (result.error) {
    return <p className={styles.state}>{result.error}</p>
  }

  return <p className={styles.state}>{t('word.lexical.noDefinition')}</p>
}
