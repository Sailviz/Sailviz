import { NextAuthConfig } from 'next-auth'
import CredentialProvider from 'next-auth/providers/credentials'
import GitHub from 'next-auth/providers/github'

const authConfig = {
    providers: [
        GitHub,
        CredentialProvider({
            credentials: {
                email: {
                    type: 'email'
                },
                password: {
                    type: 'password'
                }
            }
        })
    ],
    session: {
        strategy: 'jwt'
    },
    pages: {
        signIn: '/login' //sigin page
    },
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                // User is available during sign-in
                console.log('user', user)
                token.name = user.name ?? 'Unknown'
                token.id = user.id ?? 'unknown'
            }
            return token
        },
        session({ session, token }) {
            if (token) {
                // User is available during session
                session.user.name = token.name
            }
            return session
        }
    }
} satisfies NextAuthConfig

export default authConfig
