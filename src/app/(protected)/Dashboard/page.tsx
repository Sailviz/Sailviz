import { redirect } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import * as Fetcher from '@/components/Fetchers'
import UpcomingRacesTable from '@/components/tables/UpcomingRacesTable'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { Button, useDisclosure } from '@nextui-org/react'
import CreateEventModal from '@/components/ui/dashboard/CreateEventModal'
import { title } from '../../../components/ui/home/primitaves'
import { useSession } from 'next-auth/react'
import { auth } from '@/server/auth'
import authConfig from '@/lib/auth.config'
import Link from 'next/link'

export default async function Page() {
    // const createModal = useDisclosure()
    const controller = new AbortController()

    const session = await auth()
    if (session == null) {
        redirect(authConfig.pages.signIn)
    }
    console.log('session', session)
    // const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()

    // const createEvent = async (name: string, numberOfRaces: number) => {
    //     //create a series
    //     if (name == '' || numberOfRaces < 1) {
    //         //show error saying data is invalid
    //         return
    //     }
    //     let series = await DB.createSeries(club.id, name)
    //     for (let i = 0; i < numberOfRaces; i++) {
    //         await DB.createRace(club.id, series.id)
    //     }
    //     createModal.onClose()
    //     // mutate('/api/GetTodaysRaceByClubId')
    // }

    // const hornTest = async () => {
    //     fetch('https://' + club.settings.hornIP + '/hoot?startTime=100', {
    //         signal: controller.signal,
    //         headers: new Headers({ 'content-type': 'text/plain' })
    //     })
    // }

    return (
        <div>
            {/* <CreateEventModal isOpen={createModal.isOpen} onSubmit={createEvent} onClose={() => createModal.onClose()} /> */}
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
                            <button color='primary'>Create New Event</button>
                        </div>
                        <div className='p-6 pt-1'>
                            <Link href={'/Demo'}>
                                <button>Practice Mode</button>
                            </Link>
                        </div>
                        <div className='p-6 pt-1'>
                            <button color={'primary'}>Horn Test</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
