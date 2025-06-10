import { customSessionClient, inferAdditionalFields, usernameClient } from 'better-auth/client/plugins'
import { customSession } from 'better-auth/plugins'
import { createAuthClient } from 'better-auth/react'
import prisma from './prisma'
import { auth } from './auth'
export const client = createAuthClient({
    plugins: [
        usernameClient(),
        inferAdditionalFields({
            user: {
                clubId: {
                    type: 'string',
                    required: true
                },
                startPage: {
                    type: 'string',
                    required: true
                }
            }
        }),
        customSessionClient<typeof auth>()
    ]
})

export const { signUp, signIn, signOut, useSession, getSession } = client
