import RacesTable from '@/components/tables/RacesTable'
import { title } from '@/components/layout/home/primitaves'
import UpcomingRacesTable from '@/components/tables/UpcomingRacesTable'
import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import authConfig from '@/lib/auth.config'

export default async function Page() {
    const session = await auth()
    if (session == null) {
        redirect(authConfig.pages.signIn)
    }
    return (
        <div>
            <div className='p-6'>
                <h1 className={title({ color: 'blue' })}>Races</h1>
            </div>
            <div className='flex flex-row'>
                <div className='px-3'>
                    <p className='text-2xl font-bold p-6'>Today</p>
                    <UpcomingRacesTable session={session} />
                </div>
                <div className='px-3'>
                    <p className='text-2xl font-bold p-6'>Upcoming</p>
                    <RacesTable clubId={session.club.id} date={new Date()} historical={false} viewHref='/Race/' />
                </div>
                <div className='px-3'>
                    <p className='text-2xl font-bold p-6'>Recent</p>
                    <RacesTable clubId={session.club.id} date={new Date()} historical={true} viewHref='/Race/' />
                </div>
            </div>
        </div>
    )
}
