import { Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { useTranslation } from 'react-i18next'
import { AuthBoundary } from '@/features/auth'
import { AppShell } from '../layout/app-shell/AppShell'
import { APP_ROUTE_PATHS } from '../route-consts'
import { APP_ROUTES } from '../route-config'
import styles from './AppRouter.module.scss'

const PUBLIC_ROUTES = APP_ROUTES.filter(({ requiresAuth }) => !requiresAuth)
const AUTHENTICATED_ROUTES = APP_ROUTES.filter(({ requiresAuth }) => requiresAuth)

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
    <BrowserRouter>
      <Routes>
        {PUBLIC_ROUTES.map(({ id, Component }) => (
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
        <Route element={<AuthBoundary />}>
          <Route path={APP_ROUTE_PATHS.ROOT} element={<AppShell />}>
            <Route index element={<Navigate to={APP_ROUTE_PATHS.DICTIONARY} replace />} />
            {AUTHENTICATED_ROUTES.map(({ id, Component }) => (
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
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
