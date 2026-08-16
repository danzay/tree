import { useTranslation } from 'react-i18next'
import { Button } from 'react-aria-components/Button'
import type { LibraryItem } from '../../model/types'
import { COVER_SOURCES, LIBRARY_ITEM_MENU_ICON, LIBRARY_ITEM_TYPE_TRANSLATION_KEYS } from './consts'
import styles from './LibraryItemCard.module.scss'

interface LibraryItemCardProps {
  item: LibraryItem
  layout: 'grid' | 'list'
  onOpen: (item: LibraryItem) => void
  onOpenMenu: (item: LibraryItem) => void
}

export function LibraryItemCard({ item, layout, onOpen, onOpenMenu }: LibraryItemCardProps) {
  const { t } = useTranslation()
  const isListLayout = layout === 'list'
  const cardClassName = isListLayout ? `${styles.card} ${styles.list}` : styles.card
  const badgeVariant = styles[item.type.toLocaleLowerCase()]
  const badgeClassName = `${styles.badge} ${badgeVariant}`
  const itemTypeLabel = t(LIBRARY_ITEM_TYPE_TRANSLATION_KEYS[item.type])

  const handleOpen = () => {
    onOpen(item)
  }

  const handleOpenMenu = () => {
    onOpenMenu(item)
  }

  return (
    <article className={cardClassName}>
      <Button className={styles.main} type="button" onPress={handleOpen}>
        <img className={styles.cover} src={COVER_SOURCES[item.cover]} alt="" />
        <span className={styles.body}>
          <span className={badgeClassName}>{itemTypeLabel}</span>
          <strong className={styles.title}>{item.title}</strong>
          <span className={styles.metadata}>
            <span>{item.detail}</span>
            <span>{item.state}</span>
          </span>
        </span>
      </Button>
      <Button
        className={styles.menu}
        type="button"
        aria-label={t('libraryItem.actions.moreOptions', { title: item.title })}
        onPress={handleOpenMenu}
      >
        {LIBRARY_ITEM_MENU_ICON}
      </Button>
    </article>
  )
}
