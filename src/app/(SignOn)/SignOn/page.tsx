import { PageSkeleton } from '@/components/layout/PageSkeleton'
import TodaysRacesView from '@/components/layout/SignOn/TodaysRacesView'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import dayjs from 'dayjs'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Page() {
    return (
        <div className='h-full overflow-y-hidden'>
            <TodaysRacesView />
        </div>
    )
}
