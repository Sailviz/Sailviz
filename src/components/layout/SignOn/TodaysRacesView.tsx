'use client'

import { useRouter } from 'next/navigation'
import * as Fetcher from '@/components/Fetchers'
import SignOnTable from '@/components/tables/SignOnTable'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
export default function TodaysRacesView({ todaysRaces }: { todaysRaces: RaceDataType[] }) {
    const Router = useRouter()

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
        </>
    )
}
