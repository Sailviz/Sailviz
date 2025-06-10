import { redirect } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import * as Fetcher from '@/components/Fetchers'
import UpcomingRacesTable from '@/components/tables/UpcomingRacesTable'
import { PageSkeleton } from '@/components/layout/PageSkeleton'
import CreateEventModal from '@/components/layout/dashboard/CreateEventModal'
import { title } from '../../../components/layout/home/primitaves'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import HornTestButton from '@/components/layout/home/HornTestButton'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })
    console.log('Session:', session)
    if (!session || !session.club) {
        // If the user is not authenticated, redirect to the login page
        return <PageSkeleton />
    }
    return (
        <div>
            <div className='p-6'>
                <h1 className={title({ color: 'blue' })}>{session.club.displayName}</h1>
            </div>
            <div className='flex flex-row'>
                <div>
                    <div>
                        <p className='text-2xl font-bold p-6 pb-1'>Today&apos;s Races</p>
                        <div className='p-6 pt-1'>
                            <UpcomingRacesTable />
                        </div>
                    </div>

                    <div>
                        <p className='text-2xl font-bold p-6 pb-1'>Quick Actions</p>
                        <div className='p-6 py-1'>
                            <Link href='/SignOn'>
                                <Button>Create New Event</Button>
                            </Link>
                        </div>
                        <div className='p-6 pt-1'>
                            <Link href='/Demo'>
                                <Button>Practice Mode</Button>
                            </Link>
                        </div>
                        <div className='p-6 pt-1'>
                            <HornTestButton />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
