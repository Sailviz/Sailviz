import { useState } from 'react'
import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { PageSkeleton } from '@components/layout/PageSkeleton'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@components/helpers/users'
import { title } from '@components/layout/home/primitaves'
import { Input } from '@components/ui/input'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import { type Session } from '@sailviz/auth/client'

function Page() {
    const session: Session = useLoaderData({ from: `__root__` })
    const { data: org } = useQuery(orpcClient.organization.session.queryOptions())

    const [clockIP, setClockIP] = useState('')
    const [clockOffset, setClockOffset] = useState('')
    const [hornIP, setHornIP] = useState('')

    if (org == undefined || session == undefined) {
        return <PageSkeleton />
    }
    if (userHasPermission(session.user, AVAILABLE_PERMISSIONS.editHardware))
        return (
            <div className='flex flex-col'>
                <div className='p-6'>
                    <h1 className={title({ color: 'blue' })}>Hardware Settings</h1>
                </div>
                <p className='text-2xl font-bold px-6 py-2'>Clock Config</p>
                <div className='flex flex-row items-center px-6 py-2 w-full '>
                    <div className='w-1/3'>
                        <label className='block text-xl text-right pr-4'>IP Address</label>
                    </div>
                    <div className='w-2/3'>
                        <Input type='text' value={clockIP} onChange={e => setClockIP(e.target.value)} />
                    </div>
                </div>
                <div className='flex flex-row items-center px-6 py-2 w-full '>
                    <div className='w-1/3'>
                        <label className='block text-xl text-right pr-4'>Offset</label>
                    </div>
                    <div className='w-2/3'>
                        <Input type='number' value={clockOffset} onChange={e => setClockOffset(e.target.value)} />
                    </div>
                </div>
                <p className='text-2xl font-bold px-6 pt-6 pb-2'>Horn Config</p>
                <div className='flex flex-row items-center px-6 py-2 w-full '>
                    <div className='w-1/3'>
                        <label className='block text-xl text-right pr-4'>IP Address</label>
                    </div>
                    <div className='w-2/3'>
                        <Input type='text' value={hornIP} onChange={e => setHornIP(e.target.value)} />
                    </div>
                </div>
            </div>
        )
    else
        return (
            <div>
                <p> These Settings are unavailable to you.</p>
            </div>
        )
}

export const Route = createFileRoute('/Dashboard/Hardware/')({
    component: Page
})
