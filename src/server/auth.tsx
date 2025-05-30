import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuth, { type DefaultSession, type NextAuthConfig } from 'next-auth'

import { db } from '@/server/db'
import GitHub from 'next-auth/providers/github'
import Credentials from 'next-auth/providers/credentials'
import { Provider } from 'next-auth/providers'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { autoLoginSchema, loginSchema } from '@/constants/validation'

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
    interface Session {
        expires: string
        user: UserDataType
        club: ClubDataType
    }
}

const providers: Provider[] = [
    Credentials({
        credentials: {
            username: { label: 'username', type: 'text' },
            password: { label: 'Password', type: 'password' }
        },
        /*@ts-ignore*/ // throws a type error, but it works.
        authorize: async credentials => {
            const result = await loginSchema.parseAsync(credentials)

            const { username, password } = result

            // check to see if user exists
            const user = await prisma.user.findUnique({
                where: {
                    username: username
                },
                include: {
                    roles: true
                }
            })

            const club = await prisma.club.findUnique({
                where: {
                    id: user?.clubId
                }
            })

            // if no user was found
            if (!user || !user?.password) {
                throw new Error('No user found')
            }

            // check to see if password matches
            const passwordMatch = await bcrypt.compare(password, user.password)

            // if password does not match
            if (!passwordMatch) {
                throw new Error('Incorrect password')
            }

            return { user: user, club: club }
        }
    }),
    Credentials({
        name: 'Auto Login',
        id: 'autoLogin',
        credentials: {
            uuid: { label: 'UUID', type: 'text' }
        },
        /*@ts-ignore*/ // throws a type error, but it works.
        authorize: async credentials => {
            console.log('Auto login credentials:', credentials)
            const result = await autoLoginSchema.parseAsync(credentials)

            const { uuid } = result
            // This provider is used for auto-login, so we return null
            // to indicate that no user is being authenticated.
            const user = await prisma.user.findUnique({
                where: {
                    uuid: uuid
                },
                include: {
                    roles: true
                }
            })
            if (!user) {
                throw new Error('No user found')
            }

            const club = await prisma.club.findUnique({
                where: {
                    id: user?.clubId
                }
            })
            return { user: user, club: club }
        }
    }),
    GitHub
]

export const providerMap = providers
    .filter(provider => {
        if ((provider.options?.id || '') === 'autoLogin') {
            return false
        }
        return true
    })
    .map(provider => {
        //remvove autoLogin provider from the list

        if (typeof provider === 'function') {
            const providerData = provider()
            return { id: providerData.id, name: providerData.name }
        } else {
            return { id: provider.id, name: provider.name }
        }
    })

console.log('providerMap', providerMap)

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers,
    pages: {
        signIn: '/signin'
    },
    session: {
        strategy: 'jwt'
    },
    adapter: PrismaAdapter(db),
    callbacks: {
        jwt({ token, user }) {
            return { ...token, ...user }
        },
        async session({ session, token, user }) {
            session.user = token.user as any
            session.club = token.club as any
            return session
        }
    }
})
