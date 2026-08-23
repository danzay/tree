import { useTranslation } from 'react-i18next'
import type { LevelProgress } from '@/entities/word'
import styles from './LevelProgressChart.module.scss'

interface LevelProgressChartProps {
  levels: LevelProgress[]
}

function percentage(known: number, total: number) {
  if (total === 0) {
    return 0
  }

  return Math.round((known / total) * 100)
}

export function LevelProgressChart({ levels }: LevelProgressChartProps) {
  const { t } = useTranslation()

  return (
    <section className={styles.card} aria-labelledby="level-progress-title">
      <header>
        <h2 id="level-progress-title">{t('progress.levels.title')}</h2>
        <p>{t('progress.levels.description')}</p>
      </header>
      <ul>
        {levels.map((level) => {
          const completedPercentage = percentage(level.known, level.total)
          const completedPercentageLabel = `${completedPercentage}%`
          const progressMaximum = Math.max(level.total, 1)
          const rowClassName = `${styles.row} ${styles[level.level.toLocaleLowerCase()]}`

          return (
            <li className={rowClassName} key={level.level}>
              <div className={styles.label}>
                <strong>{level.level}</strong>
                <span>
                  {t('progress.levels.count', {
                    known: level.known.toLocaleString(),
                    total: level.total.toLocaleString(),
                  })}
                </span>
                <b>{completedPercentageLabel}</b>
              </div>
              <progress
                value={level.known}
                max={progressMaximum}
                aria-label={t('progress.levels.progressLabel', { level: level.level })}
              />
            </li>
          )
        })}
      </ul>
    </section>
  )
}
