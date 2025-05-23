import RacesTable from '@/components/tables/RacesTable'
import { title } from '@/components/layout/home/primitaves'
import UpcomingRacesTable from '@/components/tables/UpcomingRacesTable'
import { auth } from '@/server/auth'

export default async function Page() {
    const session = await auth()

    return (
        <div>
            <div className='p-6'>
                <h1 className={title({ color: 'blue' })}>Races</h1>
            </div>
            <div className='flex flex-row'>
                <div className='px-3'>
                    <p className='text-2xl font-bold p-6'>Today</p>
                    <UpcomingRacesTable />
                </div>
                <div className='px-3'>
                    <p className='text-2xl font-bold p-6'>Upcoming</p>
                    <RacesTable club={session?.user.clubId} date={new Date()} historical={false} />
                </div>
                <div className='px-3'>
                    <p className='text-2xl font-bold p-6'>Recent</p>
                    <RacesTable club={session?.user.clubId} date={new Date()} historical={true} />
                </div>
            </div>
        </div>
    )
}
