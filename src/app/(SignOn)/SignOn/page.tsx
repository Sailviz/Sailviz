import { PageSkeleton } from '@/components/layout/PageSkeleton'
import SignOnView from '@/components/layout/SignOn/SignOnView'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import dayjs from 'dayjs'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Page() {
    return (
        <div className='h-full overflow-y-hidden'>
            <SignOnView />
        </div>
    )
}
