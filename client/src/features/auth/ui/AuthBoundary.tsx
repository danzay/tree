import { useTranslation } from 'react-i18next'
import { Button } from 'react-aria-components/Button'
import { Navigate, Outlet } from 'react-router'
import { APP_ROUTE_PATHS } from '@/app/route-consts'
import { useAuthUserQuery } from '../model/use-auth'

export function AuthBoundary() {
  const { t } = useTranslation()
  const authQuery = useAuthUserQuery()

  if (authQuery.isPending) {
    return <div role="status">{t('auth.session.loading')}</div>
  }

  const handleRetry = () => {
    void authQuery.refetch()
  }

  if (authQuery.isError) {
    return (
      <div role="alert">
        <p>{t('auth.session.error')}</p>
        <Button onPress={handleRetry}>{t('auth.actions.tryAgain')}</Button>
      </div>
    )
  }

  if (authQuery.data === null) {
    return <Navigate to={APP_ROUTE_PATHS.LOGIN} replace />
  }

  return <Outlet />
}
