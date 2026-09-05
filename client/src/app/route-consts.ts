export const APP_ROUTE_IDS = {
  ACCOUNT: 'account',
  LIBRARY: 'library',
  LIBRARY_ITEM: 'library/:itemId',
  LOGIN: 'login',
  PROGRESS: 'progress',
  VOCABULARY: 'vocabulary',
} as const

export const APP_ROUTE_PATHS = {
  ROOT: '/',
  ACCOUNT: `/${APP_ROUTE_IDS.ACCOUNT}`,
  LIBRARY: `/${APP_ROUTE_IDS.LIBRARY}`,
  LIBRARY_ITEM: `/${APP_ROUTE_IDS.LIBRARY_ITEM}`,
  LOGIN: `/${APP_ROUTE_IDS.LOGIN}`,
  PROGRESS: `/${APP_ROUTE_IDS.PROGRESS}`,
  VOCABULARY: `/${APP_ROUTE_IDS.VOCABULARY}`,
  WILDCARD: '*',
} as const

export function getLibraryItemPath(itemId: number) {
  return `/${APP_ROUTE_IDS.LIBRARY}/${itemId}`
}
