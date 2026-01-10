import { useLoaderData, createFileRoute } from '@tanstack/react-router'
import { PageSkeleton } from '@components/layout/PageSkeleton'
import MembersTable from '@components/tables/MembersTable'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@components/helpers/users'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import { ActionButton } from '@components/ui/action-button'
import type { Session } from '@sailviz/auth/client'
import { useEffect, useState } from 'react'
import { client } from '@sailviz/auth/client'
import { Input } from '@components/ui/input'

function Page() {
    const session: Session = useLoaderData({ from: `__root__` })

    const [inviteEmail, setInviteEmail] = useState('')
    const [org, setOrg] = useState<any>(null)
    useEffect(() => {
        async function fetchActiveOrg() {
            const org = await client.organization.getFullOrganization()
            setOrg(org.data)
        }
        fetchActiveOrg()
    }, [])

    const inviteUser = async () => {
        const { data } = await client.organization.inviteMember({
            email: inviteEmail,
            role: 'member'
        })
        console.log('Invitation sent:', data)
    }

    if (org == undefined || session == undefined) {
        return <PageSkeleton />
    }

    if (userHasPermission(session.user, AVAILABLE_PERMISSIONS.viewUsers)) {
        return (
            <>
                <div className='p-6'>
                    Users
                    <MembersTable orgId={session.session.activeOrganizationId!} />
                    {userHasPermission(session.user, AVAILABLE_PERMISSIONS.editUsers) ? (
                        <div className='flex flex-row m-6'>
                            <Input placeholder='email' onChange={v => setInviteEmail(v.target.value)} value={inviteEmail} />
                            <ActionButton before={'Invite User'} during={'Inviting'} after={'Invited'} action={inviteUser} />
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
            </>
        )
    } else {
        return (
            <div>
                <p> These Settings are unavailable to you.</p>
            </div>
        )
    }
}

export const Route = createFileRoute('/dashboard/Users/')({
    component: Page
})
