import { APP_ROUTE_PATHS } from '../../route-consts'

export const NAVIGATION_ITEMS = [
  {
    path: APP_ROUTE_PATHS.DICTIONARY,
    translationKey: 'navigation.dictionary',
  },
  { path: APP_ROUTE_PATHS.LIBRARY, translationKey: 'navigation.library' },
  { path: APP_ROUTE_PATHS.PROGRESS, translationKey: 'navigation.progress' },
] as const

export const PROFILE_INITIALS = 'LS'
