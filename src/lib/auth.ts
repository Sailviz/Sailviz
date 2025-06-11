import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import prisma from './prisma'
import { customSession, username } from 'better-auth/plugins'
import { myPluginClient } from './client-plugin'

export const auth = betterAuth({
    plugins: [
        username(),
        customSession(async ({ user, session }) => {
            const dbUser = (await prisma.user.findUnique({
                where: { id: user.id },
                include: {
                    roles: true
                }
            })) as UserDataType | null
            if (!dbUser) {
                throw new Error('User not found')
            }
            console.log(user, session)
            const club = (await prisma.club.findFirst({
                where: {
                    id: dbUser.clubId
                }
            })) as ClubDataType | null
            return {
                club,
                user: dbUser,
                session
            }
        }),
        myPluginClient()
    ],
    user: {
        additionalFields: {
            clubId: {
                type: 'string',
                required: true,
                defaultValue: null,
                input: false
            },
            startPage: {
                type: 'string',
                required: true,
                defaultValue: 'Dashboard',
                input: false
            }
        }
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60 // Cache duration in seconds
        }
    },
    database: prismaAdapter(prisma, {
        provider: 'mysql' // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {
        enabled: true
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string
        }
    }
})
