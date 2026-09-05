import { useTranslation } from 'react-i18next'
import { VOCABULARY_LEVELS } from '@/shared/model/vocabulary-level'
import { SegmentedControl, Select } from '@/shared/ui'
import { VOCABULARY_PAGE_SIZES } from '../../model/consts'
import { LEARNING_STATUSES } from '../../model/options'
import { ALL_FILTER_VALUE, STATUS_LABEL_SEPARATOR, STATUS_SEPARATOR } from './consts'
import styles from './VocabularyFilters.module.scss'

interface VocabularyFiltersProps {
  level: string
  pageSize: number
  status: string
  onLevelChange: (level: string) => void
  onPageSizeChange: (pageSize: number) => void
  onStatusChange: (status: string) => void
}

export function VocabularyFilters({
  level,
  pageSize,
  status,
  onLevelChange,
  onPageSizeChange,
  onStatusChange,
}: VocabularyFiltersProps) {
  const { t } = useTranslation()

  const getStatusLabel = (item: string) => {
    const translationKey = `word.status.labels.${item}`
    const fallback = item.replace(STATUS_SEPARATOR, STATUS_LABEL_SEPARATOR)

    return t(translationKey, { defaultValue: fallback })
  }

  const levelOptions = [
    { value: ALL_FILTER_VALUE, label: t('vocabulary.filters.allLevels') },
    ...VOCABULARY_LEVELS.map((item) => ({ value: item, label: item })),
  ]
  const statusOptions = [
    { value: ALL_FILTER_VALUE, label: t('vocabulary.filters.allStatuses') },
    ...LEARNING_STATUSES.map((item) => ({
      value: item,
      label: getStatusLabel(item),
    })),
  ]
  const pageSizeOptions = VOCABULARY_PAGE_SIZES.map((item) => ({
    value: String(item),
    label: t('vocabulary.filters.itemsPerPageOption', { count: item }),
  }))

  const handlePageSizeChange = (value: string) => {
    onPageSizeChange(Number(value))
  }

  return (
    <section className={styles.filters} aria-label={t('vocabulary.filters.label')}>
      <SegmentedControl
        className={styles.levels}
        itemClassName={styles.levelOption}
        ariaLabel={t('vocabulary.filters.level')}
        value={level}
        options={levelOptions}
        onValueChange={onLevelChange}
      />
      <Select
        className={styles.statusField}
        triggerClassName={styles.statusControl}
        label={t('vocabulary.filters.status')}
        labelClassName={styles.label}
        value={status}
        options={statusOptions}
        onValueChange={onStatusChange}
      />
      <Select
        className={styles.pageSizeField}
        triggerClassName={styles.pageSizeControl}
        label={t('vocabulary.filters.itemsPerPage')}
        labelClassName={styles.label}
        value={String(pageSize)}
        options={pageSizeOptions}
        onValueChange={handlePageSizeChange}
      />
    </section>
  )
}
