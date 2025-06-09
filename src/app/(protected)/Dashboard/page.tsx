import { redirect } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import * as Fetcher from '@/components/Fetchers'
import UpcomingRacesTable from '@/components/tables/UpcomingRacesTable'
import { PageSkeleton } from '@/components/layout/PageSkeleton'
import CreateEventModal from '@/components/layout/dashboard/CreateEventModal'
import { title } from '../../../components/layout/home/primitaves'
import { useSession } from 'next-auth/react'
import { auth } from '@/server/auth'
import authConfig from '@/lib/auth.config'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import HornTestButton from '@/components/layout/home/HornTestButton'

export default async function Page() {
    // const createModal = useDisclosure()

    const session = await auth()
    if (session == null) {
        redirect(authConfig.pages.signIn)
    }
    console.log('Session:', session)
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
                            <UpcomingRacesTable session={session} />
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
