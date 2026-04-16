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
    fetch: (url, options) => {
        const token = localStorage.getItem('bearer_token')
        return fetch(url, {
            ...options,
            credentials: 'include',
            headers: {
                Authorization: token ? `Bearer ${token}` : ''
            }
        })
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
