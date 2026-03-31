import UpcomingRacesTable from '@components/tables/UpcomingRacesTable'
import { Button } from '@components/ui/button'
import { createFileRoute, Link } from '@tanstack/react-router'
import HornTestButton from '@components/layout/home/HornTestButton'

import CreateEventDialog from '@components/layout/dashboard/CreateEventModal'
import { useEffect, useState } from 'react'
import { client } from '@sailviz/auth/client'

function Page() {
    const [org, setOrg] = useState<any>(null)
    useEffect(() => {
        async function fetchActiveOrg() {
            const org = await client.organization.getFullOrganization()
            setOrg(org.data)
        }
        fetchActiveOrg()
    }, [])

    if (org == null) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <div className='p-6'>
                <h1>{org.name}</h1>
            </div>
            <div className='flex flex-row'>
                <div>
                    <div>
                        <p className='text-2xl font-bold p-6 pb-1'>Today&apos;s Races</p>
                        <div className='p-6 pt-1'>
                            <UpcomingRacesTable orgId={org.id} viewHref={`/dashboard/Race/`} />
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

export const Route = createFileRoute('/Dashboard/home')({
    component: Page
})
