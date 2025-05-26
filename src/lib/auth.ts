import NextAuth from 'next-auth'
import authConfig from '@/lib/auth.config'

export const { auth, handlers, signOut, signIn } = NextAuth(authConfig)
