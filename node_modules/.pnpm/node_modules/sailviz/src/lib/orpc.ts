import { createORPCClient, onError } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { type ContractRouterClient } from '@orpc/contract'
import { ORPCcontract } from '@sailviz/api/contract'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'

const link = new RPCLink({
    url: 'http://localhost:3000/',
    headers: () => ({
        authorization: 'Bearer token'
    }),
    // fetch: <-- provide fetch polyfill fetch if needed
    interceptors: [
        onError(error => {
            console.error(error)
        })
    ]
})

// Or, create a client using a contract
const client: ContractRouterClient<typeof ORPCcontract> = createORPCClient(link)
export const orpcClient = createTanstackQueryUtils(client)
