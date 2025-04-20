'use client'
import { ChangeEvent, MouseEventHandler, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import * as Fetcher from '@/components/Fetchers'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { Input, Button } from '@nextui-org/react'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@/components/helpers/users'
import { title } from '../../../../components/ui/home/primitaves'
import { useSession, signIn } from 'next-auth/react'

export default function Page() {
    const Router = useRouter()
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            signIn()
        }
    })
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()

    const [clockIP, setClockIP] = useState('')
    const [clockOffset, setClockOffset] = useState('')
    const [hornIP, setHornIP] = useState('')

    const saveClubSettings = async () => {
        console.log('ran')
        await DB.UpdateClubById({ ...club, settings: { ...club.settings, clockIP: clockIP, clockOffset: parseInt(clockOffset), hornIP: hornIP } })
    }

    useEffect(() => {
        if (club == undefined) return
        setClockIP(club.settings.clockIP)
        setClockOffset(club.settings.clockOffset.toString())
        setHornIP(club.settings.hornIP)
    }, [club])

    if (clubIsValidating || clubIsError || club == undefined || session == undefined) {
        return <PageSkeleton />
    }
    if (userHasPermission(session.user, AVAILABLE_PERMISSIONS.editHardware))
        return (
            <>
                <div className='p-6'>
                    <h1 className={title({ color: 'blue' })}>Hardware Settings</h1>
                </div>
                <p className='text-2xl font-bold px-6 py-2'>Clock Config</p>
                <div className='flex flex-row items-center px-6 py-2 w-full '>
                    <div className='w-1/3'>
                        <label className='block text-xl text-right pr-4'>IP Address</label>
                    </div>
                    <div className='w-2/3'>
                        <Input type='text' value={clockIP} onValueChange={setClockIP} />
                    </div>
                </div>
                <div className='flex flex-row items-center px-6 py-2 w-full '>
                    <div className='w-1/3'>
                        <label className='block text-xl text-right pr-4'>Offset</label>
                    </div>
                    <div className='w-2/3'>
                        <Input type='number' value={clockOffset} onValueChange={setClockOffset} />
                    </div>
                </div>
                <p className='text-2xl font-bold px-6 pt-6 pb-2'>Horn Config</p>
                <div className='flex flex-row items-center px-6 py-2 w-full '>
                    <div className='w-1/3'>
                        <label className='block text-xl text-right pr-4'>IP Address</label>
                    </div>
                    <div className='w-2/3'>
                        <Input type='text' value={hornIP} onValueChange={setHornIP} />
                    </div>
                </div>
                <div className='flex flex-col p-6 w-full'>
                    <Button onClick={saveClubSettings} color='primary'>
                        Save
                    </Button>
                </div>
            </>
        )
    else
        return (
            <div>
                <p> These Settings are unavailable to you.</p>
            </div>
        )
}
