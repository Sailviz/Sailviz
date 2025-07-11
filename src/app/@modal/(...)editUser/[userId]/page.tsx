'use client'
// Update the import path below to the correct relative path if necessary
import EditResultModal from '@/components/layout/dashboard/EditResultModal'
import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import { use } from 'react'
import * as Fetcher from '@/components/Fetchers'
import CreateResultModal from '@/components/layout/dashboard/CreateResultModal'
import CreateBoatDialog from '@/components/layout/dashboard/CreateBoatModal'

import EditBoatDialog from '@/components/layout/dashboard/EditBoatModal'
import EditUserDialog from '@/components/layout/dashboard/EditUserModal'
import { useSession } from '@/lib/auth-client'
type PageProps = { params: Promise<{ userId: string }> }

export default function Page(props: PageProps) {
    const Router = useRouter()
    const { userId } = use(props.params)
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()

    const { user, userIsError, userIsValidating } = Fetcher.User(userId)

    const editUser = async (user: UserDataType) => {
        console.log('Editing user:', user)
        await DB.updateUser(user)
        Router.back()
    }

    if (user == undefined) {
        return <div>Loading...</div>
    }

    return <EditUserDialog user={user} onSubmit={editUser} />
}
