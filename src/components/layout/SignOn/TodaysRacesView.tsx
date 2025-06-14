'use client'

import { useRouter } from 'next/navigation'
import * as Fetcher from '@/components/Fetchers'
import SignOnTable from '@/components/tables/SignOnTable'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useSession } from '@/lib/auth-client'
import { PageSkeleton } from '../PageSkeleton'
import CreateResultModal from './CreateResultModal'
import { useState } from 'react'
export default function TodaysRacesView() {
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()

    const { todaysRaces, todaysRacesIsError, todaysRacesIsValidating, mutateTodaysRaces } = Fetcher.GetTodaysRaceByClubId(session?.club?.id)
    const { boats, boatsIsError, boatsIsValidating } = Fetcher.Boats()

    const [createModal, setCreateModal] = useState(false)
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
            <CreateResultModal todaysRaces={todaysRaces} boats={boats} open={createModal} onClose={() => setCreateModal(false)} />
            <div className='w-full'>
                <div className='overflow-x-scroll flex flex-row max-h-[94vh]'>
                    {todaysRaces.map((race, index) => {
                        console.log(race)
                        return (
                            <div className='m-6 inline-block' key={race.id}>
                                <div className='text-4xl font-extrabol p-6'>
                                    {race.series.name}: {race.number} at {race.Time.slice(10, 16)}
                                </div>
                                <SignOnTable raceId={race.id} />
                            </div>
                        )
                    })}
                </div>
                <div className='mt-2 text-center max-h-[5vh] overflow-hidden'>
                    <Button variant={'green'} size={'big'} aria-label='add entry' onClick={() => setCreateModal(true)}>
                        Add Entry
                    </Button>
                </div>
            </div>
        </>
    )
}
