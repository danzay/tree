import { QueryClientProvider } from '@tanstack/react-query'
import { QUERY_CLIENT } from '@/shared/api/query-client'
import { AppRouter } from './router/AppRouter'

export function App() {
  return (
    <QueryClientProvider client={QUERY_CLIENT}>
      <AppRouter />
    </QueryClientProvider>
  )
}
