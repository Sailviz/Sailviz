import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { PageSkeleton } from '@components/layout/PageSkeleton'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@components/helpers/users'
import { title } from '@components/layout/home/primitaves'
import TrackerTable from '@components/tables/TrackerTable'
import { Button } from '@components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import type { Session } from '@sailviz/auth/client'

function Page() {
    const session: Session = useLoaderData({ from: `__root__` })

    const org = useQuery(orpcClient.organization.session.queryOptions()).data

    // const syncTrackers = async () => {
    //     await Trackable.syncTrackers(org.settings!.trackable.orgID, org.id)
    // }

    if (org == undefined || session == undefined) {
        return <PageSkeleton />
    }

    if (!org.settings!.trackable.enabled) {
        return (
            <div>
                <p>Trackable is not enabled for your club, contact support for more information</p>
            </div>
        )
    }

    if (!userHasPermission(session.user, AVAILABLE_PERMISSIONS.trackableView)) {
        return (
            <div>
                <p> These Settings are unavailable to you.</p>
            </div>
        )
    }

    return (
        <>
            <div className='p-6'>
                <h1 className={title({ color: 'blue' })}>Trackable Settings</h1>
            </div>
            <p className='text-2xl font-bold px-6 py-2'>Trackers</p>
            <div className='flex flex-row items-center px-6 py-2 w-1/2 justify-around'>
                <Button className='mx-1' color='primary' onClick={() => {}}>
                    Sync Trackers
                </Button>
            </div>
            <div className='text-2xl font-bold px-6 py-2'>
                <TrackerTable trackerStatus={() => {}} />
            </div>
        </>
    )
}

export const Route = createFileRoute('/dashboard/Trackable/')({
    component: Page
})
