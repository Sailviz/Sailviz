import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuth, { type DefaultSession, type NextAuthConfig } from 'next-auth'

import { db } from '@/server/db'
import GitHub from 'next-auth/providers/github'
import Credentials from 'next-auth/providers/credentials'
import { Provider } from 'next-auth/providers'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { loginSchema } from '@/constants/validation'

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
    session: {
        strategy: 'jwt'
    },
    adapter: PrismaAdapter(db),
    callbacks: {
        jwt({ token, user }) {
            return { ...token, ...user }
        },
        async session({ session, token, user }) {
            console.log('token', token)
            session.user = token.user as any
            session.club = token.club as any
            console.log('session', session)
            return session
        }
    }
})
