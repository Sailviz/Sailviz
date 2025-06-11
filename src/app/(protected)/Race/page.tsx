import RacesTable from '@/components/tables/RacesTable'
import { title } from '@/components/layout/home/primitaves'
import UpcomingRacesTable from '@/components/tables/UpcomingRacesTable'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { PageSkeleton } from '@/components/layout/PageSkeleton'
import prisma from '@/lib/prisma'
import dayjs from 'dayjs'

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })
    console.log('Session:', session)
    if (!session || !session.club) {
        // If the user is not authenticated, redirect to the login page
        return <PageSkeleton />
    }
    const todaysRaces = (await prisma.race.findMany({
        where: {
            AND: [
                {
                    Time: {
                        gte: dayjs().set('hour', 0).set('minute', 0).set('second', 0).format('YYYY-MM-DD HH:ss'),
                        lte: dayjs().set('hour', 24).set('minute', 0).set('second', 0).format('YYYY-MM-DD HH:ss')
                    }
                },
                {
                    series: {
                        clubId: session.club.id
                    }
                }
            ]
        },
        orderBy: {
            Time: 'asc'
        },
        include: {
            fleets: {
                include: {
                    fleetSettings: true
                }
            },
            series: true
        }
    })) as unknown as RaceDataType[]
    return (
        <div>
            <div className='p-6'>
                <h1 className={title({ color: 'blue' })}>Races</h1>
            </div>
            <div className='flex flex-row'>
                <div className='px-3'>
                    <p className='text-2xl font-bold p-6'>Today</p>
                    <UpcomingRacesTable todaysRaces={todaysRaces} />
                </div>
                <div className='px-3'>
                    <p className='text-2xl font-bold p-6'>Upcoming</p>
                    <RacesTable clubId={session.club.id} date={new Date()} historical={false} viewHref='/Race/' />
                </div>
                <div className='px-3'>
                    <p className='text-2xl font-bold p-6'>Recent</p>
                    <RacesTable clubId={session.club.id} date={new Date()} historical={true} viewHref='/Race/' />
                </div>
            </div>
        </div>
    )
}
