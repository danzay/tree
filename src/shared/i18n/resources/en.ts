export const EN_TRANSLATIONS = {
  common: {
    appName: 'tree',
  },
  navigation: {
    treeHome: 'Tree home',
    primary: 'Primary navigation',
    dictionary: 'Dictionary',
    materials: 'Materials',
    progress: 'Progress',
    openProfile: 'Open profile',
  },
  router: {
    loading: 'Loading Tree…',
  },
  materials: {
    title: 'My materials',
    subtitle: 'Everything you want to read, watch, listen to, and learn from.',
    summary: {
      materials: 'materials',
      words: 'words discovered',
    },
    actions: {
      add: 'Add material',
      dismiss: 'Dismiss message',
      moreOptions: 'More options for {{title}}',
    },
    messages: {
      openPending: '{{title}} will open when material detail pages are implemented.',
      menuPending: 'Actions for {{title}} will be added with material persistence.',
      creationPending: 'Material creation will be connected when the editor is added.',
    },
    search: {
      label: 'Search materials',
      placeholder: 'Search materials',
    },
    filters: {
      label: 'Material type filters',
      all: 'All',
      articles: 'Articles',
      stories: 'Stories',
      videos: 'Videos',
      podcasts: 'Podcasts',
      notes: 'Notes',
    },
    type: {
      article: 'Article',
      story: 'Story',
      video: 'Video',
      podcast: 'Podcast',
      note: 'Note',
    },
    sort: {
      label: 'Sort materials',
      recent: 'Recently opened',
      title: 'Title A–Z',
      type: 'Material type',
    },
    view: {
      label: 'Material layout',
      grid: 'Grid view',
      list: 'List view',
    },
    empty: {
      title: 'No materials found',
      description: 'Try a different search or material type.',
    },
  },
  dictionary: {
    header: {
      eyebrow: 'Oxford vocabulary',
      title: 'Vocabulary library',
      description: 'Search imported word senses by CEFR level and learning status.',
    },
    stats: {
      label: 'Vocabulary statistics',
      senses: 'senses',
      headwords: 'headwords',
      officialGaps: 'official gaps',
    },
    filters: {
      label: 'Vocabulary filters',
      search: 'Search',
      searchPlaceholder: 'Start typing a word…',
      level: 'Level',
      allLevels: 'All levels',
      status: 'Status',
      allStatuses: 'All statuses',
    },
    results: {
      title: 'Word senses',
      matches_one: '{{count}} match',
      matches_other: '{{count}} matches',
      loading: 'Loading…',
      empty: 'No matching vocabulary found.',
    },
    card: {
      noTranscription: 'No transcription',
      translationReview: 'Translation needs review',
      noDefinition: 'English definition not yet supplied.',
      unknownPartOfSpeech: 'part of speech unknown',
      needsReview: 'needs review',
    },
    status: {
      new: 'new',
      learning: 'learning',
      reviewing: 'reviewing',
      learned: 'learned',
      known: 'known',
      suspended: 'suspended',
    },
    errors: {
      statistics: 'Could not load vocabulary statistics',
      vocabulary: 'Could not load vocabulary',
      connection: 'Could not connect to the server',
    },
  },
  progress: {
    eyebrow: 'Progress',
    title: 'Your vocabulary tree is growing',
    description: 'The interactive PixiJS tree will be implemented in a later phase.',
  },
} as const
