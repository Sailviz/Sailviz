import { useLoaderData, createFileRoute } from '@tanstack/react-router'
import { PageSkeleton } from '@components/layout/PageSkeleton'
import UsersTable from '@components/tables/UsersTable'
import RoleTable from '@components/tables/RoleTable'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@components/helpers/users'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import { ActionButton } from '@components/ui/action-button'

function Page() {
    const session = useLoaderData({ from: `__root__` })

    const { data: club } = useQuery(orpcClient.club.session.queryOptions())

    const userCreation = useMutation(orpcClient.user.create.mutationOptions())
    const roleCreation = useMutation(orpcClient.role.create.mutationOptions())
    const queryClient = useQueryClient()

    const createUser = async () => {
        if (club == undefined) {
            throw new Error('No club found')
        }
        const user = await userCreation.mutateAsync({ clubId: club.id })
        if (user) {
            queryClient.invalidateQueries({
                queryKey: orpcClient.user.club.key({ type: 'query' })
            })
        } else {
            throw new Error('Could not create user')
        }
    }

    const createRole = async () => {
        if (club == undefined) {
            throw new Error('No club found')
        }
        const role = await roleCreation.mutateAsync({ clubId: club.id })
        console.log(role)
        if (role) {
            queryClient.invalidateQueries({
                queryKey: orpcClient.role.club.key({ type: 'query' })
            })
        } else {
            throw new Error('Could not create role')
        }
    }

    if (club == undefined || session == undefined) {
        return <PageSkeleton />
    }

    if (userHasPermission(session.user, AVAILABLE_PERMISSIONS.viewUsers)) {
        return (
            <>
                <div className='p-6'>
                    Users
                    <UsersTable />
                    {userHasPermission(session.user, AVAILABLE_PERMISSIONS.editUsers) ? (
                        <ActionButton before={'Create User'} during={'Creating'} after={'Created'} action={createUser} />
                    ) : (
                        <></>
                    )}
                </div>
                <div className='p-6'>
                    Roles
                    <RoleTable />
                    {userHasPermission(session.user, AVAILABLE_PERMISSIONS.editRoles) ? (
                        <ActionButton before={'Create Role'} during={'Creating'} after={'Created'} action={createRole} />
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
