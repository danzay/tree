import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { useVocabularyStatsQuery } from '@/entities/word'
import { useQueryErrorMessage } from '@/shared/api/useQueryErrorMessage'
import type { VocabularyLevel } from '@/shared/model/vocabulary-level'
import { PROGRESS_LEVELS_SEARCH_PARAM } from './consts'
import { getProgressLevels } from './utils/getProgressLevels'
import { getProgressOverview } from './utils/getProgressOverview'

export function useProgressPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const statsQuery = useVocabularyStatsQuery()
  const stats = statsQuery.data ?? null
  const error = useQueryErrorMessage(statsQuery, 'progress.errors.loading')
  const selectedLevels = useMemo(() => getProgressLevels(searchParams), [searchParams])
  const levelProgress = useMemo(() => {
    return stats?.levelProgress.filter((item) => selectedLevels.includes(item.level)) ?? []
  }, [selectedLevels, stats])
  const overview = useMemo(() => getProgressOverview(levelProgress), [levelProgress])

  const handleLevelsChange = (levels: VocabularyLevel[]) => {
    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.set(PROGRESS_LEVELS_SEARCH_PARAM, levels.join(','))
    setSearchParams(nextSearchParams, { replace: true })
  }

  return {
    error,
    handleLevelsChange,
    levelProgress,
    loading: statsQuery.isLoading,
    overview,
    selectedLevels,
    stats,
  }
}
