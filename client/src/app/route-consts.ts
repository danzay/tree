export const APP_ROUTE_IDS = {
  DICTIONARY: 'dictionary',
  LIBRARY: 'library',
  LIBRARY_ITEM: 'library/:itemId',
  PROGRESS: 'progress',
} as const

export const APP_ROUTE_PATHS = {
  ROOT: '/',
  DICTIONARY: `/${APP_ROUTE_IDS.DICTIONARY}`,
  LIBRARY: `/${APP_ROUTE_IDS.LIBRARY}`,
  LIBRARY_ITEM: `/${APP_ROUTE_IDS.LIBRARY_ITEM}`,
  PROGRESS: `/${APP_ROUTE_IDS.PROGRESS}`,
  WILDCARD: '*',
} as const

export function getLibraryItemPath(itemId: number) {
  return `/${APP_ROUTE_IDS.LIBRARY}/${itemId}`
}
