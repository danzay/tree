import { Suspense } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router'
import { useTranslation } from 'react-i18next'
import { AppShell } from '../layout/app-shell/AppShell'
import { APP_ROUTE_PATHS } from '../route-consts'
import { APP_ROUTES } from '../route-config'
import styles from './AppRouter.module.scss'

function RouteLoading() {
  const { t } = useTranslation()

  return (
    <div className={styles.loading} role="status">
      {t('router.loading')}
    </div>
  )
}

export function AppRouter() {
  const routeLoadingElement = <RouteLoading />

  return (
    <HashRouter>
      <Routes>
        <Route path={APP_ROUTE_PATHS.ROOT} element={<AppShell />}>
          <Route index element={<Navigate to={APP_ROUTE_PATHS.DICTIONARY} replace />} />
          {APP_ROUTES.map(({ id, Component }) => (
            <Route
              path={id}
              element={
                <Suspense fallback={routeLoadingElement}>
                  <Component />
                </Suspense>
              }
              key={id}
            />
          ))}
          <Route
            path={APP_ROUTE_PATHS.WILDCARD}
            element={<Navigate to={APP_ROUTE_PATHS.DICTIONARY} replace />}
          />
        </Route>
      </Routes>
    </HashRouter>
  )
}
