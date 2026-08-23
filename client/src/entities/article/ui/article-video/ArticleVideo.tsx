import { useTranslation } from 'react-i18next'
import { YOUTUBE_EMBED_BASE_URL } from './consts'
import styles from './ArticleVideo.module.scss'

interface ArticleVideoProps {
  articleTitle: string
  videoId: string | null
}

export function ArticleVideo({ articleTitle, videoId }: ArticleVideoProps) {
  const { t } = useTranslation()

  if (!videoId) {
    return null
  }

  return (
    <div className={styles.video}>
      <iframe
        src={`${YOUTUBE_EMBED_BASE_URL}${videoId}`}
        title={t('article.video.title', { title: articleTitle })}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  )
}
