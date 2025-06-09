import { redirect } from 'next/navigation'
import CreateResultModal from '@/components/layout/SignOn/CreateResultModal'
import { auth } from '@/server/auth'
import authConfig from '@/lib/auth.config'
import prisma from '@/lib/prisma'
import dayjs from 'dayjs'

export default async function Page() {
    const session = await auth()

    if (session == null) {
        redirect(authConfig.pages.signIn)
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

    const boats = await prisma.boat.findMany({
        where: {
            clubId: session.club.id
        },
        orderBy: {
            name: 'asc'
        }
    })

    console.log(todaysRaces)

    return <CreateResultModal session={session} todaysRaces={todaysRaces} boats={boats} />
}
