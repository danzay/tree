import coverForests from '@/assets/library/cover-forests.svg'
import coverNote from '@/assets/library/cover-note.png'
import coverPodcast from '@/assets/library/cover-podcast.svg'
import coverRoots from '@/assets/library/cover-roots.svg'
import coverVideo from '@/assets/library/cover-video.png'
import coverWalk from '@/assets/library/cover-walk.svg'
import type { LibraryItemCover, LibraryItemType } from '../../model/types'

export const COVER_SOURCES: Record<LibraryItemCover, string> = {
  forests: coverForests,
  walk: coverWalk,
  video: coverVideo,
  note: coverNote,
  podcast: coverPodcast,
  roots: coverRoots,
}

export const LIBRARY_ITEM_TYPE_TRANSLATION_KEYS: Record<LibraryItemType, string> = {
  Article: 'libraryItem.type.article',
  Story: 'libraryItem.type.story',
  Video: 'libraryItem.type.video',
  Podcast: 'libraryItem.type.podcast',
  Note: 'libraryItem.type.note',
}

export const LIBRARY_ITEM_MENU_ICON = '⋮'
