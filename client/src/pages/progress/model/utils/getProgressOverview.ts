import type { LevelProgress } from '@/entities/word'
import type { ProgressOverviewData } from '../types'

export function getProgressOverview(levels: LevelProgress[]): ProgressOverviewData {
  const total = levels.reduce((sum, level) => sum + level.total, 0)
  const known = levels.reduce((sum, level) => sum + level.known, 0)

  return {
    known,
    leftToLearn: Math.max(total - known, 0),
    total,
  }
}
