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

function Page() {
    const session: Session = useLoaderData({ from: `__root__` })

    const [org, setOrg] = useState<any>(null)
    useEffect(() => {
        async function fetchActiveOrg() {
            const org = await client.organization.getFullOrganization()
            setOrg(org.data)
        }
        fetchActiveOrg()
    }, [])

    const userCreation = useMutation(orpcClient.user.create.mutationOptions())
    const queryClient = useQueryClient()

    const createUser = async () => {
        if (org == undefined) {
            throw new Error('No org found')
        }
        const user = await userCreation.mutateAsync({ orgId: org.id })
        if (user) {
            queryClient.invalidateQueries({
                queryKey: orpcClient.user.create.key({ type: 'query' })
            })
        } else {
            throw new Error('Could not create user')
        }
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
                        <ActionButton before={'Create User'} during={'Creating'} after={'Created'} action={createUser} />
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
