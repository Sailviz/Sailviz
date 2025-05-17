import ClubTable from '@/components/tables/ClubTable'
import * as DB from '@/components/apiMethods'
import { mutate } from 'swr'
import CreateSeriesModal from '@/components/ui/dashboard/CreateSeriesModal'
import { useDisclosure } from '@nextui-org/react'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@/components/helpers/users'
import { title } from '@/components/ui/home/primitaves'
import EditSeriesModal from '@/components/ui/dashboard/EditSeriesModal'
import { redirect } from 'next/navigation'
import authConfig from '@/lib/auth.config'
import { auth } from '@/server/auth'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default async function Page() {
    const session = await auth()
    if (session == null) {
        redirect(authConfig.pages.signIn)
    }
    console.log('Session:', session)

    return (
        <div>
            {/* <EditSeriesModal seriesId={''} isOpen={editModal.isOpen} onSubmit={editSeries} onClose={editModal.onClose} /> */}
            <div className='p-6'>
                <h1 className={title({ color: 'blue' })}>Series</h1>
            </div>
            <div className='p-6'>
                <ClubTable />
            </div>
            {userHasPermission(session.user, AVAILABLE_PERMISSIONS.editSeries) ? (
                <div className='p-6'>
                    <Button href='/Series/create'>Create New Series</Button>
                </div>
            ) : (
                <></>
            )}
        </div>
    )
}
