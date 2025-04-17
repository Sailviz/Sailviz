import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuth, { type DefaultSession, type NextAuthConfig } from 'next-auth'

import { db } from '@/server/db'
import GitHub from 'next-auth/providers/github'
import Credentials from 'next-auth/providers/credentials'
import { Provider } from 'next-auth/providers'

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
    interface Session extends DefaultSession {
        user: {
            id: string
            // ...other properties
            // role: UserRole;
        } & DefaultSession['user']
    }
}

const providers: Provider[] = [
    Credentials({
        credentials: {
            username: { label: 'Username' },
            password: { label: 'Password', type: 'password' }
        },
        async authorize({ username, password }) {
            const request = new Request('/api/auth/signin', {
                method: 'POST',
                body: JSON.stringify({ username, password }),
                headers: { 'Content-Type': 'application/json' }
            })
            const response = await fetch(request)
            if (!response.ok) return null
            return (await response.json()) ?? null
        }
    }),
    GitHub
]

export const providerMap = providers.map(provider => {
    if (typeof provider === 'function') {
        const providerData = provider()
        return { id: providerData.id, name: providerData.name }
    } else {
        return { id: provider.id, name: provider.name }
    }
})

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers,
    pages: {
        signIn: '/signin'
    },
    adapter: PrismaAdapter(db),
    callbacks: {
        session: ({ session, user }) => ({
            ...session,
            user: {
                ...session.user,
                id: user.id
            }
        })
    }
})
