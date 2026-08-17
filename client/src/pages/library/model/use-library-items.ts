import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getLibraryItems, type LibraryItem } from '@/entities/library-item'
import { getRequestErrorMessage, isRequestCanceled } from '@/shared/api/api-client'

export function useLibraryItems() {
  const { t } = useTranslation()
  const [items, setItems] = useState<LibraryItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    getLibraryItems(controller.signal)
      .then(setItems)
      .catch((caught: unknown) => {
        if (!isRequestCanceled(caught)) {
          setError(
            getRequestErrorMessage(
              caught,
              t('library.errors.loading'),
              t('dictionary.errors.connection'),
            ),
          )
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [t])

  return { error, items, loading }
}
