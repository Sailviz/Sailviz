import { NextAuthConfig } from 'next-auth/index'
import CredentialProvider from 'next-auth/providers/credentials'
import GithubProvider from 'next-auth/providers/github'

const authConfig = {
    providers: [
        GithubProvider({}),
        CredentialProvider({
            credentials: {
                username: {
                    type: 'username'
                },
                password: {
                    type: 'password'
                }
            },
            async authorize(credentials, req) {
                const user = {
                    id: '1',
                    name: 'John'
                }
                if (user) {
                    // Any object returned will be saved in `user` property of the JWT
                    return user
                } else {
                    // If you return null then an error will be displayed advising the user to check their details.
                    return null

                    // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
                }
            }
        })
    ],
    pages: {
        signIn: '/' //sigin page
    }
} satisfies NextAuthConfig

export default authConfig
