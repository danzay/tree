import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { APP_ROUTE_PATHS } from '@/app/route-consts'
import { ArticleContent, ArticleHeader, ArticleVideo } from '@/entities/article'
import { useArticlePage } from '../../model/use-article-page'
import { ArticleSidebar } from '../article-sidebar/ArticleSidebar'
import styles from './ArticlePage.module.scss'

export function ArticlePage() {
  const { t } = useTranslation()
  const page = useArticlePage()

  if (page.loading) {
    return (
      <div className={styles.state} role="status">
        {t('article.loading')}
      </div>
    )
  }

  if (page.error || !page.article) {
    return (
      <div className={styles.state} role="alert">
        <h1>{t('article.errors.title')}</h1>
        <p>{page.error ?? t('article.errors.notFound')}</p>
        <Link to={APP_ROUTE_PATHS.LIBRARY}>{t('article.actions.backToLibrary')}</Link>
      </div>
    )
  }

  return (
    <section className={styles.page}>
      <nav className={styles.breadcrumbs} aria-label={t('article.breadcrumbs.label')}>
        <Link to={APP_ROUTE_PATHS.LIBRARY}>{t('navigation.library')}</Link>
        <span aria-hidden="true">›</span>
        <span>{page.article.item.title}</span>
      </nav>
      <div className={styles.layout}>
        <article className={styles.paper}>
          <ArticleHeader item={page.article.item} />
          <ArticleVideo
            articleTitle={page.article.item.title}
            videoId={page.article.item.youtubeVideoId}
          />
          <ArticleContent
            blocks={page.article.blocks}
            selectedSenseId={page.selectedSenseId}
            onTextSelect={page.selectText}
            onWordSelect={page.selectWord}
          />
        </article>
        <ArticleSidebar
          item={page.article.item}
          wordInfo={page.wordInfo}
          selectedSenseId={page.selectedSenseId}
          selectedText={page.selectedText}
          wordError={page.selectedWord.error}
          wordLoading={page.selectedWord.loading}
          wordSense={page.selectedWord.sense}
          onWordClose={page.closeSidebar}
        />
      </div>
    </section>
  )
}
