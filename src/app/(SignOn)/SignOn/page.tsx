import TodaysRacesView from '@/components/layout/SignOn/TodaysRacesView'
import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import authConfig from '@/lib/auth.config'

export default async function Page() {
    const session = await auth()
    if (session == null) {
        redirect(authConfig.pages.signIn)
    }
    return (
        <div className='h-full overflow-y-hidden'>
            <TodaysRacesView session={session} />
        </div>
    )
}
