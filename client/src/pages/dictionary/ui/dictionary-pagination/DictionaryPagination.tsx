import { useTranslation } from 'react-i18next'
import { Button } from 'react-aria-components/Button'
import styles from './DictionaryPagination.module.scss'

interface DictionaryPaginationProps {
  disabled: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function DictionaryPagination({
  disabled,
  page,
  totalPages,
  onPageChange,
}: DictionaryPaginationProps) {
  const { t } = useTranslation()
  const previousIsDisabled = disabled || page <= 1
  const nextIsDisabled = disabled || page >= totalPages

  const handlePrevious = () => {
    onPageChange(page - 1)
  }

  const handleNext = () => {
    onPageChange(page + 1)
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <nav className={styles.pagination} aria-label={t('dictionary.pagination.label')}>
      <Button className={styles.button} isDisabled={previousIsDisabled} onPress={handlePrevious}>
        {t('dictionary.pagination.previous')}
      </Button>
      <span>{t('dictionary.pagination.position', { page, totalPages })}</span>
      <Button className={styles.button} isDisabled={nextIsDisabled} onPress={handleNext}>
        {t('dictionary.pagination.next')}
      </Button>
    </nav>
  )
}
