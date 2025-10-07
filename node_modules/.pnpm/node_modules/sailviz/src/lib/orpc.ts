import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import type { Router } from '@sailviz/api/router'

export const orpc = createORPCClient<Router>(
    new RPCLink({
        url: 'http://localhost:3000', // or your deployed API URL
        headers: {
            Authorization: 'Bearer your-token-here' // optional
        }
    })
)
