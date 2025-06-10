import TodaysRacesView from '@/components/layout/SignOn/TodaysRacesView'
import { redirect } from 'next/navigation'

export default async function Page() {
    return (
        <div className='h-full overflow-y-hidden'>
            <TodaysRacesView />
        </div>
    )
}
