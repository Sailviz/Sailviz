import { redirect } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import * as Fetcher from '@/components/Fetchers'
import UpcomingRacesTable from '@/components/tables/UpcomingRacesTable'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import CreateEventModal from '@/components/ui/dashboard/CreateEventModal'
import { title } from '../../../components/ui/home/primitaves'
import { useSession } from 'next-auth/react'
import { auth } from '@/server/auth'
import authConfig from '@/lib/auth.config'
import Button from '@/components/ui/Button'

export default async function Page() {
    // const createModal = useDisclosure()

    const session = await auth()
    if (session == null) {
        redirect(authConfig.pages.signIn)
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
                            <Button href='/Dashboard/createEvent'>Create New Event</Button>
                        </div>
                        <div className='p-6 pt-1'>
                            <Button href={'/Demo'}>Practice Mode</Button>
                        </div>
                        <div className='p-6 pt-1'>
                            <Button href='/'>Horn Test</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
