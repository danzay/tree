import { useTranslation } from 'react-i18next'
import { Button } from 'react-aria-components/Button'
import { ADD_LIBRARY_ITEM_ICON, LIBRARY_ITEM_SUMMARY_SEPARATOR } from './consts'
import styles from './LibraryHero.module.scss'

interface LibraryHeroProps {
  itemsTotal: number
  vocabularyTotal: number
  onAddItem: () => void
}

export function LibraryHero({ itemsTotal, vocabularyTotal, onAddItem }: LibraryHeroProps) {
  const { t } = useTranslation()

  return (
    <header className={styles.hero}>
      <div>
        <h1 id="library-title">{t('library.title')}</h1>
        <p>{t('library.subtitle')}</p>
      </div>
      <p className={styles.summary}>
        <strong>{itemsTotal}</strong>
        <span>{t('library.summary.items')}</span>
        <span aria-hidden="true">{LIBRARY_ITEM_SUMMARY_SEPARATOR}</span>
        <strong>{vocabularyTotal}</strong>
        <span>{t('library.summary.words')}</span>
      </p>
      <Button className={styles.addButton} type="button" onPress={onAddItem}>
        <span aria-hidden="true">{ADD_LIBRARY_ITEM_ICON}</span>
        {t('library.actions.add')}
      </Button>
    </header>
  )
}
