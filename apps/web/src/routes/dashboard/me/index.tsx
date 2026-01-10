import type { Session } from '@lib/session'
import { client } from '@sailviz/auth/client'
import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import * as Types from '@sailviz/types'
import InvitationsTable from '@components/tables/InvitationsTable'

function Page() {
    const session: Session = useLoaderData({ from: `__root__` })

    const [invitations, setInvitations] = useState<Types.Invitation[]>([])

    useEffect(() => {
        async function fetchInvitations() {
            const { data } = await client.organization.listUserInvitations()
            if (!data) return
            console.log('Fetched invitations:', data)
            setInvitations(data)
        }
        fetchInvitations()
    }, [])

    return (
        <div>
            Hello {session?.user.name}
            <div> Pending Invitations:</div>
            <InvitationsTable />
        </div>
    )
}

export const Route = createFileRoute('/dashboard/me/')({
    component: Page
})
