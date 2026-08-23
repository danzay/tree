import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from 'react-aria-components'
import type { DictionaryDefinitionGroup } from '../../model/lexical-types'
import { LABEL_SEPARATOR, LIST_SEPARATOR, VISIBLE_DEFINITION_COUNT } from './consts'
import styles from './WordDefinitionGroup.module.scss'

interface WordDefinitionGroupProps {
  group: DictionaryDefinitionGroup
}

export function WordDefinitionGroup({ group }: WordDefinitionGroupProps) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const withHiddenDefinitions = group.definitions.length > VISIBLE_DEFINITION_COUNT
  const hiddenDefinitionCount = group.definitions.length - VISIBLE_DEFINITION_COUNT
  const visibleDefinitions = expanded
    ? group.definitions
    : group.definitions.slice(0, VISIBLE_DEFINITION_COUNT)
  const toggleLabel = expanded
    ? t('word.lexical.showFewerDefinitions')
    : t('word.lexical.showMoreDefinitions', { count: hiddenDefinitionCount })
  const handleToggle = () => {
    setExpanded((currentExpanded) => !currentExpanded)
  }

  return (
    <section className={styles.group}>
      <ol>
        {visibleDefinitions.map((definition, index) => {
          const withExample = Boolean(definition.example)
          const withSynonyms = definition.synonyms.length > 0
          const withAntonyms = definition.antonyms.length > 0
          const synonyms = `${t('word.lexical.synonyms')}${LABEL_SEPARATOR}${definition.synonyms.join(LIST_SEPARATOR)}`
          const antonyms = `${t('word.lexical.antonyms')}${LABEL_SEPARATOR}${definition.antonyms.join(LIST_SEPARATOR)}`

          return (
            <li key={`${definition.definition}-${index}`}>
              <p>{definition.definition}</p>
              {withExample && <blockquote>{definition.example}</blockquote>}
              {withSynonyms && <p className={styles.related}>{synonyms}</p>}
              {withAntonyms && <p className={styles.related}>{antonyms}</p>}
            </li>
          )
        })}
      </ol>
      {withHiddenDefinitions && (
        <Button className={styles.toggle} aria-expanded={expanded} onPress={handleToggle}>
          {toggleLabel}
        </Button>
      )}
    </section>
  )
}
