import { PageSkeleton } from '@/components/layout/PageSkeleton'
import TodaysRacesView from '@/components/layout/SignOn/TodaysRacesView'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import dayjs from 'dayjs'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

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
        <div className='h-full overflow-y-hidden'>
            <TodaysRacesView todaysRaces={todaysRaces} />
        </div>
    )
}
