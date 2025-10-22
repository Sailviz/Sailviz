import { createORPCClient, onError } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { type ContractRouterClient } from '@orpc/contract'
import { ORPCcontract } from '@sailviz/api/contract'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'

const link = new RPCLink({
    url: 'http://localhost:3000/',
    headers: () => ({}),
    // fetch: <-- provide fetch polyfill fetch if needed
    // remove the hard-coded Authorization header and let the browser send cookies
    // ensure cookies (better-auth session cookie) are sent with each request
    // RPCLink supports supplying a fetch implementation — we wrap the global fetch
    fetch: (input: RequestInfo, init?: RequestInit) => fetch(input, { ...(init ?? {}), credentials: 'include' }),
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
