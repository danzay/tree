import { NavLink, Outlet, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Button } from 'react-aria-components/Button'
import { TreeLogo } from '@/shared/ui'
import { APP_ROUTE_PATHS } from '../../route-consts'
import { NAVIGATION_ITEMS, PROFILE_INITIALS } from './consts'
import styles from './AppShell.module.scss'

export function AppShell() {
  const location = useLocation()
  const { t } = useTranslation()
  const isPathActive = (path: string) => location.pathname.startsWith(path)

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <NavLink
          className={styles.brand}
          to={APP_ROUTE_PATHS.DICTIONARY}
          aria-label={t('navigation.treeHome')}
        >
          <TreeLogo />
        </NavLink>

        <nav className={styles.navigation} aria-label={t('navigation.primary')}>
          {NAVIGATION_ITEMS.map(({ path, translationKey }) => (
            <NavLink
              className={styles.navigationLink}
              data-active={isPathActive(path) || undefined}
              to={path}
              key={path}
            >
              {t(translationKey)}
            </NavLink>
          ))}
        </nav>

        <Button
          className={styles.profileButton}
          type="button"
          aria-label={t('navigation.openProfile')}
        >
          <span aria-hidden="true">{PROFILE_INITIALS}</span>
        </Button>
      </header>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
