import type { TranslationDefinition } from '../../model/lexical-types'
import styles from './WordTranslationGroup.module.scss'

interface WordTranslationGroupProps {
  definition: TranslationDefinition
}

export function WordTranslationGroup({ definition }: WordTranslationGroupProps) {
  return (
    <section className={styles.group}>
      <ul>
        {definition.translations.map((translation, index) => (
          <li key={`${translation}-${index}`}>{translation}</li>
        ))}
      </ul>
    </section>
  )
}
