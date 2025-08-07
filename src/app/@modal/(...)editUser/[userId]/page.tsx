'use client'
import { use } from 'react'
import * as Fetcher from '@/components/Fetchers'
import EditUserDialog from '@/components/layout/dashboard/EditUserModal'

type PageProps = { params: Promise<{ userId: string }> }

export default function Page(props: PageProps) {
    const { userId } = use(props.params)

    const { user, userIsError, userIsValidating } = Fetcher.User(userId)

    if (user == undefined) {
        return <div>Loading...</div>
    }

    return <EditUserDialog user={user} />
}
