import { useQuery } from '@tanstack/react-query'
import { fetchSession, sessionQueryKey } from '../lib/session'

export function useSession(options?: { staleTime?: number }) {
    return useQuery({
        queryKey: sessionQueryKey,
        queryFn: fetchSession,
        staleTime: options?.staleTime ?? 60_000
    })
}
