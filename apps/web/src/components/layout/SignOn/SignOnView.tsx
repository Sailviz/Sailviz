import SignOnTable from '@components/tables/SignOnTable'
import { PageSkeleton } from '../PageSkeleton'
import CreateResultModal from './CreateResultModal'
import { useLoaderData } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import type { BoatType } from '@sailviz/types'
import { client, type Session } from '@sailviz/auth/client'
export default function SignOnView() {
    const session: Session = useLoaderData({ from: `__root__` })

    const { data: todaysRaces } = useQuery(orpcClient.race.today.queryOptions({ input: { orgId: session.session.activeOrganizationId! } }))
    const boats = useQuery(orpcClient.boat.org.session.queryOptions()).data as BoatType[]

    const metadata = JSON.parse(client.useActiveOrganization().data?.metadata || '{}')
    const { data: trackers } = useQuery(
        orpcClient.trackable.device.list.queryOptions({
            input: { orgId: metadata.trackable.orgId || '' },
            enabled: metadata !== undefined
        })
    )
    if (todaysRaces === undefined) {
        return <PageSkeleton />
    }
    console.log(todaysRaces)
    if (todaysRaces?.length <= 0) {
        return (
            <div>
                <p className='text-6xl font-extrabol p-6'> No Races Today</p>
            </div>
        )
    }
    return (
        <>
            <div className='w-full'>
                <div className='overflow-x-scroll flex flex-row max-h-[94vh]'>
                    {todaysRaces.map(race => {
                        console.log(race)
                        return (
                            <div className='m-6 inline-block' key={race.id}>
                                <div className='text-4xl font-extrabol p-6'>
                                    Series Name: {race.number} at {race.Time.slice(10, 16)}
                                </div>
                                <SignOnTable raceId={race.id} />
                            </div>
                        )
                    })}
                </div>
                <div className='mt-2 text-center max-h-[5vh] overflow-hidden'>
                    <CreateResultModal todaysRaces={todaysRaces} boats={boats} trackers={trackers ?? []} />
                </div>
            </div>
        </>
    )
}
