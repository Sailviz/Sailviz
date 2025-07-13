'use client'
import { title } from '@/components/layout/home/primitaves'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSession } from '@/lib/auth-client'
import { useEffect, useState } from 'react'
import * as Fetcher from '@/components/Fetchers'
import * as DB from '@/components/apiMethods'
export default function Page() {
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()
    console.log('Session:', session)

    const [demoClubId, setDemoClubId] = useState('')
    const [demoSeriesId, setDemoSeriesId] = useState('')
    const [demoDataId, setDemoDataId] = useState('')
    const [demoUUID, setDemoUUID] = useState('')

    const { GlobalConfig, GlobalConfigIsError, GlobalConfigIsValidating } = Fetcher.UseGlobalConfig()

    useEffect(() => {
        if (GlobalConfig == undefined || GlobalConfigIsValidating) {
            return
        }
        setDemoClubId(GlobalConfig.demoClubId)
        setDemoSeriesId(GlobalConfig.demoSeriesId)
        setDemoDataId(GlobalConfig.demoDataId)
        setDemoUUID(GlobalConfig.demoUUID)
    }, [GlobalConfig, GlobalConfigIsValidating])

    const save = async () => {
        await DB.updateGlobalConfig({
            demoClubId: demoClubId,
            demoSeriesId: demoSeriesId,
            demoDataId: demoDataId,
            demoUUID: demoUUID
        })
    }

    return (
        <div className='w-full'>
            <div className='p-6'>
                <h1 className={title({ color: 'blue' })}>Demo</h1>
            </div>
            <div className='flex flex-row items-center px-6 py-2 w-full '>
                <div className='w-1/3'>
                    <label className='block text-xl text-right pr-4'>Demo Club Id</label>
                </div>
                <div className='w-2/3'>
                    <Input type='text' value={demoClubId} onChange={e => setDemoClubId(e.target.value)} />
                </div>
            </div>
            <div className='flex flex-row items-center px-6 py-2 w-full '>
                <div className='w-1/3'>
                    <label className='block text-xl text-right pr-4'>Demo Series Id</label>
                </div>
                <div className='w-2/3'>
                    <Input type='text' value={demoSeriesId} onChange={e => setDemoSeriesId(e.target.value)} />
                </div>
            </div>
            <div className='flex flex-row items-center px-6 py-2 w-full '>
                <div className='w-1/3'>
                    <label className='block text-xl text-right pr-4'>Demo Data Id</label>
                </div>
                <div className='w-2/3'>
                    <Input type='text' value={demoDataId} onChange={e => setDemoDataId(e.target.value)} />
                </div>
            </div>
            <div className='flex flex-row items-center px-6 py-2 w-full '>
                <div className='w-1/3'>
                    <label className='block text-xl text-right pr-4'>Demo UUID</label>
                </div>
                <div className='w-2/3'>
                    <Input type='text' value={demoUUID} onChange={e => setDemoUUID(e.target.value)} />
                </div>
            </div>
            <div className='flex flex-col p-6 w-full'>
                <Button onClick={save} color='primary'>
                    Save
                </Button>
            </div>
        </div>
    )
}
