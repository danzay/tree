import { useTranslation } from 'react-i18next'
import { getQueryErrorKey } from './getQueryErrorKey'
import type { QueryErrorState } from './types'

export function useQueryErrorMessage(query: QueryErrorState, fallbackKey: string) {
  const { t } = useTranslation()
  const errorKey = getQueryErrorKey(query, fallbackKey)

  return errorKey === null ? null : t(errorKey)
}
