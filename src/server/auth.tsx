import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuth, { type DefaultSession, type NextAuthConfig } from 'next-auth'

import { db } from '@/server/db'
import GitHub from 'next-auth/providers/github'
import Credentials from 'next-auth/providers/credentials'
import { Provider } from 'next-auth/providers'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { autoLoginSchema, loginSchema } from '@/constants/validation'
import { stripe } from '@/lib/payments/stripe'

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

export const Register = async (formData: FormData) => {
    'use server'
    const clubName = formData.get('clubName') as string
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    if (!clubName || !username || !password) {
        throw new Error('All fields are required')
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    //create stripe customerid
    const customer = await stripe.customers.create({
        description: `Customer for ${clubName}`,
        metadata: {
            clubName: clubName
        }
    })

    // Create the club and user
    const clubId = crypto.randomUUID() // Generate a unique club ID
    const club = await prisma.club.create({
        data: {
            id: clubId,
            name: clubName,
            // this is just
            settings: {
                duties: ['Race Officer', 'Assistant Race Officer', 'Safety Officer', 'Assistant Safety Officer', 'Duty Officer'],
                hornIP: '',
                clockIP: '',
                trackable: { orgID: '', enabled: false },
                clockOffset: 1,
                pursuitLength: 60
            },
            stripe: {
                create: {
                    customerId: customer.id,
                    subscriptionId: null,
                    productId: null,
                    planName: null,
                    subscriptionStatus: 'inactive',
                    updatedAt: new Date().toISOString()
                }
            },
            users: {
                create: [
                    {
                        username: username,
                        password: hashedPassword,
                        displayName: username,
                        startPage: 'Dashboard',
                        roles: {
                            create: [
                                {
                                    clubId: clubId,
                                    name: 'Admin',
                                    permissions: {
                                        allowed: [
                                            { label: 'Edit Series', value: 'editSeries' },
                                            { label: 'Edit Races', value: 'editRaces' },
                                            { label: 'Edit Fleets', value: 'editFleets' },
                                            { label: 'Edit Results', value: 'editResults' },
                                            { label: 'Edit Boats', value: 'editBoats' },
                                            { label: 'Edit Hardware', value: 'editHardware' },
                                            { label: 'Edit Users', value: 'editUsers' },
                                            { label: 'Edit Roles', value: 'editRoles' },
                                            { label: 'Download Results', value: 'DownloadResults' },
                                            { label: 'Upload Entries', value: 'UploadEntires' },
                                            { label: 'View Integrations', value: 'viewIntegrations' },
                                            { label: 'View Developer', value: 'viewDeveloper' },
                                            { label: 'View Users', value: 'viewUsers' },
                                            { label: 'Dashboard Access', value: 'dashboardAccess' },
                                            { label: 'Edit Duties', value: 'editDuties' },
                                            { label: 'Trackable - View Settings', value: 'trackableView' },
                                            { label: 'Advanced Result edit', value: 'advancedResultEdit' }
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    })

    return club
}
