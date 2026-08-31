export const EN_TRANSLATIONS = {
  common: {
    appName: 'tree',
    errors: {
      connection: 'Could not connect to the server',
    },
  },
  navigation: {
    treeHome: 'Tree home',
    primary: 'Primary navigation',
    dictionary: 'Dictionary',
    library: 'Library',
    progress: 'Progress',
    openProfile: 'Open profile',
  },
  router: {
    loading: 'Loading Tree…',
  },
  libraryItem: {
    coverAlt: 'Cover for {{title}}',
    readTime_one: '{{count}} min read',
    readTime_other: '{{count}} min read',
    actions: {
      moreOptions: 'More options for {{title}}',
    },
    type: {
      article: 'Article',
      story: 'Story',
      video: 'Video',
      podcast: 'Podcast',
      note: 'Note',
    },
    status: {
      notStarted: 'Not started',
      inProgress: 'In progress',
      completed: 'Completed',
    },
  },
  library: {
    title: 'My library',
    subtitle: 'Everything you want to read, watch, listen to, and learn from.',
    summary: {
      items: 'items',
      words: 'words discovered',
    },
    actions: {
      add: 'Add item',
      dismiss: 'Dismiss message',
    },
    messages: {
      menuPending: 'Actions for {{title}} will be added with library persistence.',
      creationPending: 'Library item creation will be connected when the editor is added.',
    },
    search: {
      label: 'Search library',
      placeholder: 'Search library',
    },
    filters: {
      label: 'Library item type filters',
      all: 'All',
      articles: 'Articles',
      stories: 'Stories',
      videos: 'Videos',
      podcasts: 'Podcasts',
      notes: 'Notes',
    },
    sort: {
      label: 'Sort library items',
      recent: 'Recently opened',
      title: 'Title A–Z',
      type: 'Item type',
    },
    view: {
      label: 'Library layout',
      grid: 'Grid view',
      list: 'List view',
    },
    empty: {
      title: 'No library items found',
      description: 'Try a different search or item type.',
    },
    loading: 'Loading your library…',
    errors: {
      title: 'Library unavailable',
      loading: 'Could not load the library',
    },
  },
  article: {
    loading: 'Loading article…',
    breadcrumbs: {
      label: 'Article navigation',
    },
    about: {
      topic: 'Topic',
    },
    video: {
      title: 'Video for {{title}}',
    },
    vocabulary: {
      title: 'Vocabulary levels',
      description: 'New and learning words are coloured by CEFR level.',
    },
    actions: {
      backToLibrary: 'Back to library',
    },
    errors: {
      title: 'Article unavailable',
      loading: 'Could not load the article',
      notFound: 'This article could not be found.',
    },
  },
  word: {
    panel: {
      label: 'Word information',
      close: 'Close word information',
      loading: 'Loading word information…',
      translation: 'Translation',
      definition: 'Definition',
      collocations: 'Collocations',
      errors: {
        title: 'Word information unavailable',
        loading: 'Could not load word information',
      },
    },
    selectedWord: {
      eyebrow: 'Selected text',
      title: '“{{text}}”',
    },
    lexical: {
      loadingDefinition: 'Looking up definitions…',
      loadingTranslation: 'Looking up translations…',
      noDefinition: 'No English definition was found.',
      noTranslation: 'No Russian translation was found.',
      synonyms: 'Synonyms',
      antonyms: 'Antonyms',
      meanings: 'English meanings',
      partOfSpeechTabs: 'Word information by part of speech',
      playPronunciation: 'Play pronunciation',
      showMoreDefinitions: 'Show {{count}} more',
      showFewerDefinitions: 'Show fewer',
      errors: {
        definition: 'Could not load definitions',
        translation: 'Could not load translations',
      },
    },
  },
  dictionary: {
    header: {
      eyebrow: 'Oxford vocabulary',
      title: 'Vocabulary library',
      description: 'Search imported word senses by CEFR level and learning status.',
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
    pagination: {
      label: 'Dictionary pages',
      previous: 'Previous',
      next: 'Next',
      position: 'Page {{page}} of {{totalPages}}',
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
      vocabulary: 'Could not load vocabulary',
    },
  },
  progress: {
    eyebrow: 'Progress',
    title: 'Your vocabulary is growing',
    description: 'See how much of every Oxford level you already know and what remains to learn.',
    loading: 'Loading your progress…',
    overview: {
      eyebrow: 'Overall progress',
      title: 'All vocabulary',
      total: 'All words',
      known: 'Already known',
      left: 'Left to learn',
      progressLabel: 'Overall vocabulary progress',
    },
    levels: {
      title: 'Progress by level',
      description: 'Completed words at each CEFR level.',
      count: '{{known}} of {{total}} words',
      progressLabel: '{{level}} vocabulary progress',
    },
    errors: {
      title: 'Progress unavailable',
      loading: 'Could not load progress statistics',
    },
  },
} as const
