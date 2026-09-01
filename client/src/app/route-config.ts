import { lazy } from 'react'
import { APP_ROUTE_IDS } from './route-consts'

export const APP_ROUTES = [
  {
    id: APP_ROUTE_IDS.LOGIN,
    requiresAuth: false,
    Component: lazy(async () => {
      const { LoginPage } = await import('@/pages/login')
      return { default: LoginPage }
    }),
  },
  {
    id: APP_ROUTE_IDS.ACCOUNT,
    requiresAuth: true,
    Component: lazy(async () => {
      const { AccountPage } = await import('@/pages/account')
      return { default: AccountPage }
    }),
  },
  {
    id: APP_ROUTE_IDS.DICTIONARY,
    requiresAuth: true,
    Component: lazy(async () => {
      const { DictionaryPage } = await import('@/pages/dictionary')
      return { default: DictionaryPage }
    }),
  },
  {
    id: APP_ROUTE_IDS.LIBRARY,
    requiresAuth: true,
    Component: lazy(async () => {
      const { LibraryPage } = await import('@/pages/library')
      return { default: LibraryPage }
    }),
  },
  {
    id: APP_ROUTE_IDS.LIBRARY_ITEM,
    requiresAuth: true,
    Component: lazy(async () => {
      const { ArticlePage } = await import('@/pages/article')
      return { default: ArticlePage }
    }),
  },
  {
    id: APP_ROUTE_IDS.PROGRESS,
    requiresAuth: true,
    Component: lazy(async () => {
      const { ProgressPage } = await import('@/pages/progress')
      return { default: ProgressPage }
    }),
  },
] as const
