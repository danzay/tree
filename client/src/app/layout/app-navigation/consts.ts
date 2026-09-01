import { BookOpen, Library, Sprout } from 'lucide-react'
import { APP_ROUTE_PATHS } from '../../route-consts'

export const NAVIGATION_ITEMS = [
  {
    Icon: BookOpen,
    path: APP_ROUTE_PATHS.DICTIONARY,
    translationKey: 'navigation.dictionary',
  },
  {
    Icon: Library,
    path: APP_ROUTE_PATHS.LIBRARY,
    translationKey: 'navigation.library',
  },
  {
    Icon: Sprout,
    path: APP_ROUTE_PATHS.PROGRESS,
    translationKey: 'navigation.progress',
  },
] as const

export const PROFILE_INITIALS = 'LS'
