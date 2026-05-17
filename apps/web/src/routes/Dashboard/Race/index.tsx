import UpcomingRacesTable from '@components/tables/UpcomingRacesTable'
import { PageSkeleton } from '@components/layout/PageSkeleton'
import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import type { Session } from '@sailviz/auth/client'
import { useRaceTableFilters } from '@features/race/race-table/use-race-table-filters'
import { Suspense } from 'react'
import { DataTableSkeleton } from '@components/ui/table/data-table-skeleton'
import PageContainer from '@components/layout/page-container'
import { Heading } from '@components/ui/heading'
import RaceTable from '@features/race/race-table'

function Page() {
    const session: Session = useLoaderData({ from: `__root__` })

    const orgId = session?.session.activeOrganizationId

    console.log('Session:', session)
    if (!session || !orgId) {
        // If the user is not authenticated, redirect to the login page
        return <PageSkeleton />
    }

    return (
        <PageContainer scrollable={false}>
            <div className='flex flex-1 flex-col space-y-4'>
                <div className='flex items-start justify-between'>
                    <Heading title='Races' description='Manage races' />
                </div>
                <div className='px-3'>
                    <p className='text-2xl font-bold p-6'>Today</p>
                    <UpcomingRacesTable orgId={orgId} viewHref={`/dashboard/Race/`} />
                </div>
                <div className='px-3 h-full'>
                    <p className='text-2xl font-bold p-6'>Upcoming</p>
                    <Suspense fallback={<DataTableSkeleton columnCount={3} rowCount={10} />}>
                        <RaceTable historical={false} filters={useRaceTableFilters()} orgId={orgId} date={new Date()} />
                    </Suspense>
                </div>
                <div className='px-3'>
                    <p className='text-2xl font-bold p-6'>Recent</p>
                    <Suspense fallback={<DataTableSkeleton columnCount={3} rowCount={10} />}>
                        <RaceTable historical={true} filters={useRaceTableFilters()} orgId={orgId} date={new Date()} />
                    </Suspense>
                </div>
            </div>
        </PageContainer>
    )
}

export const Route = createFileRoute('/Dashboard/Race/')({
    component: Page
})
