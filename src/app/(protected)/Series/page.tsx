import ClubTable from '@/components/tables/ClubTable'
import * as DB from '@/components/apiMethods'
import { mutate } from 'swr'
import CreateSeriesModal from '@/components/layout/dashboard/CreateSeriesModal'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@/components/helpers/users'
import { title } from '@/components/layout/home/primitaves'
import EditSeriesModal from '@/components/layout/dashboard/EditSeriesModal'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { PageSkeleton } from '@/components/layout/PageSkeleton'

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })
    console.log('Session:', session)
    if (!session || !session.club) {
        // If the user is not authenticated, redirect to the login page
        return <PageSkeleton />
    }

    return (
        <div>
            {/* <EditSeriesModal seriesId={''} isOpen={editModal.isOpen} onSubmit={editSeries} onClose={editModal.onClose} /> */}
            <div className='p-6'>
                <h1 className={title({ color: 'blue' })}>Series</h1>
            </div>
            {userHasPermission(session.user, AVAILABLE_PERMISSIONS.editSeries) ? (
                <div className='p-6'>
                    <Link href='/Series/create'>
                        <Button>Create New Series</Button>
                    </Link>
                </div>
            ) : (
                <></>
            )}
            <div className='p-6'>
                <ClubTable viewHref='/Series/' />
            </div>
        </div>
    )
}
