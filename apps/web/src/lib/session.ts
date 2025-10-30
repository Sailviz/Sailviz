import type { QueryClient } from '@tanstack/react-query'
import { getSession } from '@sailviz/auth/client'

export const sessionQueryKey = ['session'] as const

export type Session = Awaited<ReturnType<typeof getSession>>['data']

export async function fetchSession(): Promise<Session> {
    const { data } = await getSession()
    return data
}

export function ensureSession(queryClient: QueryClient) {
    return queryClient.ensureQueryData({
        queryKey: sessionQueryKey,
        queryFn: fetchSession
    })
}

export async function ensureAdmin(queryClient: QueryClient) {
    const session = await ensureSession(queryClient)
    if (!session) {
        return null
    }
    // Check if the user has admin flag set to true
    if (!session.user?.admin) {
        return null
    }
    return session
}
