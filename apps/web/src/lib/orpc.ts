import { createORPCClient, onError } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { type ContractRouterClient } from '@orpc/contract'
import { ORPCcontract } from '@sailviz/api/contract'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'

if (import.meta.env.VITE_API_URL == undefined) {
    throw new Error('API_URL is not defined in environment variables')
}
const link = new RPCLink({
    url: import.meta.env.VITE_API_URL,
    // Provide Authorization header from localStorage when available (Tauri/dev token path).
    // For web cookie-based flow this returns empty and cookies are used via `credentials: 'include'`.
    headers: () => {
        try {
            if (typeof window !== 'undefined') {
                const token = (window as any).localStorage?.getItem('sailviz_token')
                if (token) return { Authorization: `Bearer ${token}` }
            }
        } catch (e) {}
        return {}
    },
    // RPCLink supports supplying a fetch implementation — we wrap the global fetch
    // to ensure cookies are included for web sessions and to inject the
    // Authorization header from localStorage when available (synchronous).
    fetch: (input: RequestInfo, init?: RequestInit) => {
        try {
            const token = typeof window !== 'undefined' ? (window as any).localStorage?.getItem('sailviz_token') : null
            const headers = new Headers((init?.headers as HeadersInit) || {})
            if (token) headers.set('Authorization', `Bearer ${token}`)
            const merged: RequestInit = { ...(init ?? {}), credentials: 'include', headers }
            return fetch(input, merged)
        } catch (e) {
            return fetch(input, { ...(init ?? {}), credentials: 'include' })
        }
    },
    interceptors: [
        onError((error: any) => {
            if (error.name !== 'AbortError') {
                console.error(error)
            }
        })
    ]
})

// Or, create a client using a contract
const client: ContractRouterClient<typeof ORPCcontract> = createORPCClient(link)
export const orpcClient = createTanstackQueryUtils(client)
