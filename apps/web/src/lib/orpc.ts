import { createORPCClient, onError } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { type ContractRouterClient } from '@orpc/contract'
import { ORPCcontract } from '@sailviz/api/contract'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'

console.log('API URL:', import.meta.env.VITE_API_URL)
if (import.meta.env.VITE_API_URL == undefined) {
    throw new Error('API_URL is not defined in environment variables')
}
const link = new RPCLink({
    url: import.meta.env.VITE_API_URL,
    fetch: (url, options) => {
        return fetch(url, {
            ...options,
            credentials: 'include'
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
