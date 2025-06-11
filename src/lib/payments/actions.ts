'use server'

import { redirect } from 'next/navigation'
import { createCheckoutSession, createCustomerPortalSession } from './stripe'
import prisma from '../prisma'
import { auth } from '../auth'
import { headers } from 'next/headers'

type ActionWithTeamFunction<T> = (formData: FormData, club: ClubDataType) => Promise<T>

function withTeam<T>(action: ActionWithTeamFunction<T>) {
    return async (formData: FormData): Promise<T> => {
        const session = await auth.api.getSession({
            headers: await headers() // you need to pass the headers object.
        })
        console.log('Session:', session)
        if (!session) {
            redirect('/Login')
        }
        const club = (await prisma.club.findFirst({
            where: {
                id: session.user.clubId
            },
            include: {
                stripe: true
            }
        })) as ClubDataType | null
        if (!club) {
            throw new Error('Club not found')
        }

        return action(formData, club)
    }
}

export const checkoutAction = withTeam(async (formData, club) => {
    const priceId = formData.get('priceId') as string
    await createCheckoutSession({ club: club, priceId })
})

export const customerPortalAction = withTeam(async (_: any, club: ClubDataType) => {
    const portalSession = await createCustomerPortalSession(club)
    redirect(portalSession.url)
})
