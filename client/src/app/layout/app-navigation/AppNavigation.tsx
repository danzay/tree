import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from 'react-aria-components/Button'
import { NavLink, useLocation } from 'react-router'
import { useAuthUserQuery } from '@/features/auth'
import { TreeLogo } from '@/shared/ui'
import { APP_ROUTE_PATHS } from '../../route-consts'
import { NAVIGATION_ITEMS } from './consts'
import { getProfileInitials } from './utils/getProfileInitials'
import styles from './AppNavigation.module.scss'

interface AppNavigationProps {
  expanded: boolean
  onToggle: () => void
}

export function AppNavigation({ expanded, onToggle }: AppNavigationProps) {
  const location = useLocation()
  const { t } = useTranslation()
  const authQuery = useAuthUserQuery()
  const ToggleIcon = expanded ? ChevronLeft : ChevronRight
  const toggleLabel = t(expanded ? 'navigation.collapseSidebar' : 'navigation.expandSidebar')
  const isPathActive = (path: string) => location.pathname.startsWith(path)
  const accountIsActive = isPathActive(APP_ROUTE_PATHS.ACCOUNT)
  const profileInitials = getProfileInitials(authQuery.data?.displayName ?? '')
  const profileLabel = authQuery.data?.displayName.trim() || t('navigation.account')

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
        <NavLink
          className={styles.profileButton}
          to={APP_ROUTE_PATHS.ACCOUNT}
          aria-current={accountIsActive ? 'page' : undefined}
          data-active={accountIsActive || undefined}
          aria-label={t('navigation.openProfile')}
        >
          <span className={styles.profileInitials} aria-hidden="true">
            {profileInitials}
          </span>
          <span className={styles.profileLabel}>{profileLabel}</span>
        </NavLink>
      </div>
    </header>
  )
}
