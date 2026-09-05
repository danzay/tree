import { useTranslation } from 'react-i18next'
import { Button } from 'react-aria-components/Button'
import styles from './VocabularyPagination.module.scss'

interface VocabularyPaginationProps {
  disabled: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function VocabularyPagination({
  disabled,
  page,
  totalPages,
  onPageChange,
}: VocabularyPaginationProps) {
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
    <nav className={styles.pagination} aria-label={t('vocabulary.pagination.label')}>
      <Button className={styles.button} isDisabled={previousIsDisabled} onPress={handlePrevious}>
        {t('vocabulary.pagination.previous')}
      </Button>
      <span>{t('vocabulary.pagination.position', { page, totalPages })}</span>
      <Button className={styles.button} isDisabled={nextIsDisabled} onPress={handleNext}>
        {t('vocabulary.pagination.next')}
      </Button>
    </nav>
  )
}
