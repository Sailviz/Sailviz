import RacesTable from '@components/tables/RacesTable'
import { title } from '@components/layout/home/primitaves'
import UpcomingRacesTable from '@components/tables/UpcomingRacesTable'

import { PageSkeleton } from '@components/layout/PageSkeleton'

import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import type { Session } from '@sailviz/auth/client'

function Page() {
    const session: Session = useLoaderData({ from: `__root__` })

    const orgId = session?.session.activeOrganizationId

    console.log('Session:', session)
    if (!session || !orgId) {
        // If the user is not authenticated, redirect to the login page
        return <PageSkeleton />
    }

    return (
        <div>
            <div className='p-6'>
                <h1 className={title({ color: 'blue' })}>Races</h1>
            </div>
            <div className='flex flex-row'>
                <div className='px-3'>
                    <p className='text-2xl font-bold p-6'>Today</p>
                    <UpcomingRacesTable />
                </div>
                <div className='px-3'>
                    <p className='text-2xl font-bold p-6'>Upcoming</p>
                    <RacesTable orgId={orgId} date={new Date()} historical={false} viewHref='/dashboard/Race/' />
                </div>
                <div className='px-3'>
                    <p className='text-2xl font-bold p-6'>Recent</p>
                    <RacesTable orgId={orgId} date={new Date()} historical={true} viewHref='/dashboard/Race/' />
                </div>
            </div>
        </div>
    )
}

export const Route = createFileRoute('/dashboard/Race/')({
    component: Page
})
