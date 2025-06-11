import { createAuthEndpoint } from 'better-auth/api'
import { BetterAuthPlugin } from 'better-auth/plugins'
import prisma from './prisma'
import { setSessionCookie } from 'better-auth/cookies'
// Dummy function: replace with your actual user lookup/auth logic
async function readUserByUUID(uuid: string) {
    // Example: fetch user from DB and return user object or null
    const user = await prisma.user.findUnique({
        where: { uuid: uuid }
    })
    return user
}

export const myPlugin = () => {
    return {
        id: 'my-plugin',
        endpoints: {
            authByUUID: createAuthEndpoint(
                '/my-plugin/auth-by-uuid',
                {
                    method: 'POST'
                },
                async ctx => {
                    const { uuid } = ctx.body
                    console.log('Received UUID:', uuid)
                    if (!uuid) {
                        return ctx.json({ error: 'UUID required' }, { status: 400 })
                    }
                    const user = await readUserByUUID(uuid)
                    console.log('User found:', user)
                    if (!user) {
                        return ctx.json({ error: 'User not found' }, { status: 404 })
                    }

                    const session = {
                        id: crypto.randomUUID(),
                        token: crypto.randomUUID(),
                        userId: user.id,
                        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day expiry
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                    await setSessionCookie(ctx, {
                        session,
                        user
                    })
                    return ctx.json({
                        message: 'Authenticated',
                        user
                    })
                }
            )
        }
    } satisfies BetterAuthPlugin
}

export const myPluginInstance = myPlugin()
