import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import * as Types from '@sailviz/types'
import EventMap from './EventMap'
import { useState, useEffect } from 'react'

export default function CourseView({ raceId }: { raceId: string }) {
    const race = useQuery(orpcClient.race.find.queryOptions({ input: { raceId: raceId! } })).data as Types.RaceType
    const [courseBuoys, setCourseBuoys] = useState<Types.CourseBuoyType[]>([])

    // Initialize local state when race data is fetched
    useEffect(() => {
        if (race?.courseBuoys) {
            setCourseBuoys(race.courseBuoys)
        }
    }, [race])

    if (race?.courseBuoys?.length == 0) return <></>

    return (
        <div className='w-full border rounded-md p-4 flex flex-row'>
            <div className='flex items-center justify-between w-full mb-4'>
                <h2 className='text-xl font-bold'>Course</h2>
                {courseBuoys?.map(buoy => (
                    <div key={buoy.id} className='flex flex-col items-center space-x-2'>
                        <div
                            className='flex items-center justify-center w-20 h-20 font-extrabold'
                            style={{ backgroundColor: buoy.side === 'port' ? 'red' : 'green', borderRadius: '5%' }}
                        >
                            {buoy.buoy.name}
                        </div>
                    </div>
                ))}
            </div>
            <div className='w-1/3 justify-self-end'>
                <EventMap raceId={raceId} windowHeight={400} />
            </div>
        </div>
    )
}
