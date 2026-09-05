import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateWordStatus } from '../api/word-sense-api'
import { WORD_QUERY_KEYS } from './query-keys'

export function useUpdateWordStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateWordStatus,
    onSuccess: async (sense) => {
      queryClient.setQueryData(WORD_QUERY_KEYS.sense(Number(sense.id)), sense)

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: WORD_QUERY_KEYS.lists }),
        queryClient.invalidateQueries({ queryKey: WORD_QUERY_KEYS.stats }),
      ])
    },
  })
}
