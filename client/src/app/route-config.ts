import { lazy } from 'react'
import { APP_ROUTE_IDS } from './route-consts'

export const APP_ROUTES = [
  {
    id: APP_ROUTE_IDS.DICTIONARY,
    Component: lazy(async () => {
      const { DictionaryPage } = await import('@/pages/dictionary')
      return { default: DictionaryPage }
    }),
  },
  {
    id: APP_ROUTE_IDS.LIBRARY,
    Component: lazy(async () => {
      const { LibraryPage } = await import('@/pages/library')
      return { default: LibraryPage }
    }),
  },
  {
    id: APP_ROUTE_IDS.LIBRARY_ITEM,
    Component: lazy(async () => {
      const { ArticlePage } = await import('@/pages/article')
      return { default: ArticlePage }
    }),
  },
  {
    id: APP_ROUTE_IDS.PROGRESS,
    Component: lazy(async () => {
      const { ProgressPage } = await import('@/pages/progress')
      return { default: ProgressPage }
    }),
  },
] as const
