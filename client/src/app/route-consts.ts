export const APP_ROUTE_IDS = {
  ACCOUNT: 'account',
  DICTIONARY: 'dictionary',
  LIBRARY: 'library',
  LIBRARY_ITEM: 'library/:itemId',
  PROGRESS: 'progress',
  LOGIN: 'login',
} as const

export const APP_ROUTE_PATHS = {
  ROOT: '/',
  ACCOUNT: `/${APP_ROUTE_IDS.ACCOUNT}`,
  DICTIONARY: `/${APP_ROUTE_IDS.DICTIONARY}`,
  LIBRARY: `/${APP_ROUTE_IDS.LIBRARY}`,
  LIBRARY_ITEM: `/${APP_ROUTE_IDS.LIBRARY_ITEM}`,
  PROGRESS: `/${APP_ROUTE_IDS.PROGRESS}`,
  LOGIN: `/${APP_ROUTE_IDS.LOGIN}`,
  WILDCARD: '*',
} as const

export function getLibraryItemPath(itemId: number) {
  return `/${APP_ROUTE_IDS.LIBRARY}/${itemId}`
}
