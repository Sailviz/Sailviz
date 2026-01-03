import SignOnTable from '@components/tables/SignOnTable'
import { PageSkeleton } from '../PageSkeleton'
import CreateResultModal from './CreateResultModal'
import { useLoaderData } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import type { BoatType, RaceType } from '@sailviz/types'
export default function SignOnView() {
    const session = useLoaderData({ from: `__root__` })

    const todaysRaces = useQuery(orpcClient.race.today.queryOptions({ input: { orgId: session?.club?.id! } })).data as RaceType[]
    const boats = useQuery(orpcClient.boat.session.queryOptions()).data as BoatType[]

    if (todaysRaces === undefined) {
        return <PageSkeleton />
    }
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
                    <CreateResultModal todaysRaces={todaysRaces} boats={boats} />
                </div>
            </div>
        </>
    )
}
