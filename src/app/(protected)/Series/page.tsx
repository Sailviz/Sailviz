'use client'
import ClubTable from '@/components/tables/ClubTable'
import * as DB from '@/components/apiMethods'
import { mutate } from 'swr'
import CreateSeriesModal from '@/components/layout/dashboard/CreateSeriesModal'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@/components/helpers/users'
import { title } from '@/components/layout/home/primitaves'
import { PageSkeleton } from '@/components/layout/PageSkeleton'
import { useSession } from '@/lib/auth-client'
import { use } from 'chai'
import { useEffect, useState } from 'react'
import { set } from 'cypress/types/lodash'

export default function Page() {
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()

    const [allowCreate, setAllowCreate] = useState(false)

    const createSeries = async (seriesName: string) => {
        // Here you would typically call an API to create the series
        // For example:
        await DB.createSeries(session?.user?.clubId!, seriesName)
        // After creating the series, you might want to redirect or update the UI
        mutate('/api/GetSeriesByClubId') // This will revalidate the series data
    }

    useEffect(() => {
        const checkSubscription = async () => {
            console.log('Session:', session)
            if (session?.club?.stripe.subscriptionStatus !== 'active') {
                //check how many series the user has
                const series = await DB.GetSeriesByClubId(session?.user?.clubId!)
                console.log('Series:', series)
                setAllowCreate(series.length === 0)

                // if not active, only allow a single series to be created
            } else {
                //if the user has an active subscription, allow them to create multiple series
                setAllowCreate(true)
            }
        }
        checkSubscription()
    }, [session])

    if (!session || !session.club) {
        // If the user is not authenticated, redirect to the login page
        return <PageSkeleton />
    }

    return (
        <div>
            <div className='p-6'>
                <h1 className={title({ color: 'blue' })}>Series</h1>
            </div>
            {userHasPermission(session.user, AVAILABLE_PERMISSIONS.editSeries) ? (
                <div className='p-6'>
                    <CreateSeriesModal onSubmit={createSeries} allowCreate={allowCreate} />
                </div>
            ) : (
                <></>
            )}
            <div className='p-6'>
                <ClubTable viewHref='/Series/' />
            </div>
        </div>
    )
}
