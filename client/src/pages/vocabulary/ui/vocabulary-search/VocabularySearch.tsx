import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Input, Label, SearchField } from 'react-aria-components/SearchField'
import styles from './VocabularySearch.module.scss'

interface VocabularySearchProps {
  value: string
  onChange: (value: string) => void
}

export function VocabularySearch({ value, onChange }: VocabularySearchProps) {
  const { t } = useTranslation()

  return (
    <SearchField className={styles.field} value={value} onChange={onChange}>
      <Label className={styles.label}>{t('vocabulary.filters.search')}</Label>
      <Search className={styles.icon} aria-hidden="true" size={20} strokeWidth={1.8} />
      <Input className={styles.control} placeholder={t('vocabulary.filters.searchPlaceholder')} />
    </SearchField>
  )
}
