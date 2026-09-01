import { Outlet } from 'react-router'
import { useAppShellStore } from '../../model/app-shell-store'
import { AppNavigation } from '../app-navigation/AppNavigation'
import styles from './AppShell.module.scss'

export function AppShell() {
  const sidebarExpanded = useAppShellStore((state) => state.sidebarExpanded)
  const toggleSidebar = useAppShellStore((state) => state.toggleSidebar)

  return (
    <div className={styles.shell} data-sidebar-expanded={sidebarExpanded || undefined}>
      <AppNavigation expanded={sidebarExpanded} onToggle={toggleSidebar} />
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
