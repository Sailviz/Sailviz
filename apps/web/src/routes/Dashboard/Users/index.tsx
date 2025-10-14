import { useLoaderData, createFileRoute } from '@tanstack/react-router'
import { PageSkeleton } from '@components/layout/PageSkeleton'
import UsersTable from '@components/tables/UsersTable'
import RoleTable from '@components/tables/RoleTable'
import EditUserModal from '@components/layout/dashboard/EditUserModal'
import { mutate } from 'swr'
import EditRoleModal from '@components/layout/dashboard/EditRoleModal'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@components/helpers/users'
import { Button } from '@components/ui/button'
import { useMutation, useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'

export default function Page() {
    const session = useLoaderData({ from: `__root__` })

    const { data: club } = useQuery(orpcClient.club.session.queryOptions())

    const userCreation = useMutation(orpcClient.user.create.mutationOptions())
    const roleCreation = useMutation(orpcClient.role.create.mutationOptions())

    const createUser = async () => {
        if (club == undefined) {
            throw new Error('No club found')
        }
        const user = await userCreation.mutateAsync({ clubId: club.id })
        if (user) {
            mutate('/api/GetUsersByClubId')
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
            mutate('/api/GetRolesByClubId')
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
                    {userHasPermission(session.user, AVAILABLE_PERMISSIONS.editUsers) ? <Button onClick={createUser}>Create User</Button> : <></>}
                </div>
                <div className='p-6'>
                    Roles
                    <RoleTable />
                    {userHasPermission(session.user, AVAILABLE_PERMISSIONS.editRoles) ? <Button onClick={createRole}>Create Role</Button> : <></>}
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

export const Route = createFileRoute('/Dashboard/Users/')({
    component: Page
})
