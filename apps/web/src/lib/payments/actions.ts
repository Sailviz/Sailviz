import { createCheckoutSession, createCustomerPortalSession } from './stripe'
import { getSession } from '@sailviz/auth/client'
import { redirect } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import type { ClubType } from '@sailviz/types'

type ActionWithTeamFunction<T> = (formData: FormData, club: ClubType) => Promise<T>

function withTeam<T>(action: ActionWithTeamFunction<T>) {
    const fetchClubMutation = useMutation(orpcClient.club.find.mutationOptions())

    return async (formData: FormData): Promise<T> => {
        const session = await getSession()
        console.log('Session:', session)
        if (!session) {
            redirect({ to: '/Login' })
            return action(formData, null as any) // This line will never be reached due to redirect, but TypeScript needs it
        }
        // Replace 'clubId' with the correct property or fetch it another way
        // For example, if the user's club ID is stored in 'startPage' or another property, use that
        // Otherwise, you may need to update your session type to include 'clubId'
        const clubId = (session.data!.user as any).clubId // TEMP: cast to any if you are sure clubId exists at runtime
        if (!clubId) {
            throw new Error('User does not have a clubId')
        }
        const club = await fetchClubMutation.mutateAsync({ clubId })
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

export const customerPortalAction = withTeam(async (_: any, club: ClubType) => {
    const portalSession = await createCustomerPortalSession(club)
    redirect({ to: portalSession.url })
})
