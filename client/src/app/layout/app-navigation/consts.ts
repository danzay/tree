import { BookOpen, Library, Sprout } from 'lucide-react'
import { APP_ROUTE_PATHS } from '../../route-consts'

export const NAVIGATION_ITEMS = [
  {
    Icon: Library,
    path: APP_ROUTE_PATHS.LIBRARY,
    translationKey: 'navigation.library',
  },
  {
    Icon: BookOpen,
    path: APP_ROUTE_PATHS.VOCABULARY,
    translationKey: 'navigation.vocabulary',
  },
  {
    Icon: Sprout,
    path: APP_ROUTE_PATHS.PROGRESS,
    translationKey: 'navigation.progress',
  },
] as const
