import { skipToken, useQuery } from '@tanstack/react-query'
import { getArticle } from '../api/article-api'
import { ARTICLE_QUERY_KEYS } from './query-keys'

export function useArticleQuery(id: number | null) {
  return useQuery({
    queryKey: ARTICLE_QUERY_KEYS.detail(id),
    queryFn: id === null ? skipToken : ({ signal }) => getArticle(id, signal),
  })
}
