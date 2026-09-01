import { useTranslation } from 'react-i18next'
import { getAuthErrorKey } from '../model/utils/getAuthErrorKey'

interface AuthErrorMessageProps {
  error: unknown
  fallbackKey: string
  className?: string
}

export function AuthErrorMessage({ error, fallbackKey, className }: AuthErrorMessageProps) {
  const { t } = useTranslation()

  return (
    <p className={className} role="alert">
      {t(getAuthErrorKey(error, fallbackKey))}
    </p>
  )
}
