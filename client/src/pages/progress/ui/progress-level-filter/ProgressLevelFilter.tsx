import { ToggleButton, ToggleButtonGroup } from 'react-aria-components'
import type { Key } from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import { VOCABULARY_LEVELS, type VocabularyLevel } from '@/shared/model/vocabulary-level'
import styles from './ProgressLevelFilter.module.scss'

interface ProgressLevelFilterProps {
  selectedLevels: VocabularyLevel[]
  onChange: (levels: VocabularyLevel[]) => void
}

export function ProgressLevelFilter({ selectedLevels, onChange }: ProgressLevelFilterProps) {
  const { t } = useTranslation()

  const handleSelectionChange = (keys: Set<Key>) => {
    const levels = VOCABULARY_LEVELS.filter((level) => keys.has(level))
    onChange(levels)
  }

  return (
    <section className={styles.filter} aria-labelledby="progress-level-filter-title">
      <div>
        <h2 id="progress-level-filter-title">{t('progress.filters.title')}</h2>
        <p>{t('progress.filters.description')}</p>
      </div>
      <ToggleButtonGroup
        aria-label={t('progress.filters.label')}
        className={styles.levels}
        disallowEmptySelection
        onSelectionChange={handleSelectionChange}
        orientation="horizontal"
        selectedKeys={selectedLevels}
        selectionMode="multiple"
      >
        {VOCABULARY_LEVELS.map((level) => (
          <ToggleButton className={styles.level} id={level} key={level}>
            {level}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </section>
  )
}
