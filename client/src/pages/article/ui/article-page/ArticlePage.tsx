import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { APP_ROUTE_PATHS } from '@/app/route-consts'
import { useArticlePage } from '../../model/use-article-page'
import { ArticleContent } from '../article-content/ArticleContent'
import { ArticleCover } from '../article-cover/ArticleCover'
import { ArticleHeader } from '../article-header/ArticleHeader'
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
          <ArticleContent blocks={page.article.blocks} />
        </article>
        <ArticleCover item={page.article.item} />
      </div>
    </section>
  )
}
