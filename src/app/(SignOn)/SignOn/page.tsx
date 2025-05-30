'use client'
import SignOnTable from '@/components/tables/SignOnTable'
import * as Fetcher from '@/components/Fetchers'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function Page() {
    const { data: session, status } = useSession()

    const { todaysRaces, todaysRacesIsError, todaysRacesIsValidating } = Fetcher.GetTodaysRaceByClubId(session?.club!)

    return (
        <div className='h-full overflow-y-hidden'>
            {todaysRaces?.length > 0 ? (
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
                        <Link href={'/SignOn/createResult'}>
                            <Button variant={'green'} size={'big'} aria-label='add entry'>
                                Add Entry
                            </Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div>
                    <p className='text-6xl font-extrabol p-6'> No Races Today</p>
                </div>
            )}
        </div>
    )
}
