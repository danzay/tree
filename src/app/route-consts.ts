export const APP_ROUTE_IDS = {
  DICTIONARY: 'dictionary',
  LIBRARY: 'library',
  PROGRESS: 'progress',
} as const

export const APP_ROUTE_PATHS = {
  ROOT: '/',
  DICTIONARY: `/${APP_ROUTE_IDS.DICTIONARY}`,
  LIBRARY: `/${APP_ROUTE_IDS.LIBRARY}`,
  PROGRESS: `/${APP_ROUTE_IDS.PROGRESS}`,
  WILDCARD: '*',
} as const
