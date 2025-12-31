import UpcomingRacesTable from '@components/tables/UpcomingRacesTable'
import { title } from '@components/layout/home/primitaves'
import { Button } from '@components/ui/button'
import { createFileRoute, Link, useLoaderData } from '@tanstack/react-router'
import HornTestButton from '@components/layout/home/HornTestButton'

import CreateEventDialog from '@components/layout/dashboard/CreateEventModal'

function Page() {
    const session = useLoaderData({ from: `__root__` })
    return (
        <div>
            <div className='p-6'>
                <h1 className={title({ color: 'blue' })}>{session.session.activeOrganizationId}</h1>
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
                            <CreateEventDialog />
                        </div>
                        <div className='p-6 pt-1'>
                            <Link to='/Demo'>
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

export const Route = createFileRoute('/dashboard/home')({
    component: Page
})
