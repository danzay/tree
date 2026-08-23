import { useTranslation } from 'react-i18next'
import { Input, Label, SearchField } from 'react-aria-components/SearchField'
import { VOCABULARY_LEVELS } from '@/shared/model/vocabulary-level'
import { Select } from '@/shared/ui'
import { LEARNING_STATUSES } from '../../model/options'
import { ALL_FILTER_VALUE, STATUS_LABEL_SEPARATOR, STATUS_SEPARATOR } from './consts'
import styles from './DictionaryFilters.module.scss'

interface DictionaryFiltersProps {
  search: string
  level: string
  status: string
  onSearchChange: (search: string) => void
  onLevelChange: (level: string) => void
  onStatusChange: (status: string) => void
}

export function DictionaryFilters({
  search,
  level,
  status,
  onSearchChange,
  onLevelChange,
  onStatusChange,
}: DictionaryFiltersProps) {
  const { t } = useTranslation()

  const getStatusLabel = (item: string) => {
    const translationKey = `dictionary.status.${item}`
    const fallback = item.replace(STATUS_SEPARATOR, STATUS_LABEL_SEPARATOR)
    return t(translationKey, { defaultValue: fallback })
  }

  const levelOptions = [
    { value: ALL_FILTER_VALUE, label: t('dictionary.filters.allLevels') },
    ...VOCABULARY_LEVELS.map((item) => ({ value: item, label: item })),
  ]
  const statusOptions = [
    { value: ALL_FILTER_VALUE, label: t('dictionary.filters.allStatuses') },
    ...LEARNING_STATUSES.map((item) => ({
      value: item,
      label: getStatusLabel(item),
    })),
  ]

  return (
    <section className={styles.filters} aria-label={t('dictionary.filters.label')}>
      <SearchField className={styles.field} value={search} onChange={onSearchChange}>
        <Label className={styles.label}>{t('dictionary.filters.search')}</Label>
        <Input className={styles.control} placeholder={t('dictionary.filters.searchPlaceholder')} />
      </SearchField>
      <Select
        className={styles.field}
        triggerClassName={styles.control}
        label={t('dictionary.filters.level')}
        labelClassName={styles.label}
        value={level}
        options={levelOptions}
        onValueChange={onLevelChange}
      />
      <Select
        className={styles.field}
        triggerClassName={styles.control}
        label={t('dictionary.filters.status')}
        labelClassName={styles.label}
        value={status}
        options={statusOptions}
        onValueChange={onStatusChange}
      />
    </section>
  )
}
