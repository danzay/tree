import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from 'react-aria-components/Button'
import { NavLink, useLocation } from 'react-router'
import { TreeLogo } from '@/shared/ui'
import { APP_ROUTE_PATHS } from '../../route-consts'
import { NAVIGATION_ITEMS, PROFILE_INITIALS } from './consts'
import styles from './AppNavigation.module.scss'

interface AppNavigationProps {
  expanded: boolean
  onToggle: () => void
}

export function AppNavigation({ expanded, onToggle }: AppNavigationProps) {
  const location = useLocation()
  const { t } = useTranslation()
  const ToggleIcon = expanded ? ChevronLeft : ChevronRight
  const toggleLabel = t(expanded ? 'navigation.collapseSidebar' : 'navigation.expandSidebar')
  const isPathActive = (path: string) => location.pathname.startsWith(path)

  return (
    <header className={styles.panel} data-expanded={expanded || undefined}>
      <div className={styles.top}>
        <NavLink
          className={styles.brand}
          to={APP_ROUTE_PATHS.DICTIONARY}
          aria-label={t('navigation.treeHome')}
        >
          <span className={styles.logoFrame}>
            <TreeLogo compact={!expanded} />
          </span>
        </NavLink>
        <Button
          className={styles.collapseButton}
          type="button"
          aria-label={toggleLabel}
          onPress={onToggle}
        >
          <ToggleIcon aria-hidden="true" />
        </Button>
      </div>

      <nav className={styles.navigation} aria-label={t('navigation.primary')}>
        {NAVIGATION_ITEMS.map(({ Icon, path, translationKey }) => {
          const label = t(translationKey)
          const isActive = isPathActive(path)

          return (
            <NavLink
              className={styles.navigationLink}
              aria-current={isActive ? 'page' : undefined}
              data-active={isActive || undefined}
              title={label}
              to={path}
              key={path}
            >
              <Icon className={styles.navigationIcon} aria-hidden="true" />
              <span className={styles.navigationLabel}>{label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className={styles.actions}>
        <Button
          className={styles.profileButton}
          type="button"
          aria-label={t('navigation.openProfile')}
        >
          <span aria-hidden="true">{PROFILE_INITIALS}</span>
        </Button>
      </div>
    </header>
  )
}
