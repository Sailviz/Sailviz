'use client'
import { ChangeEvent, MouseEventHandler, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import * as Fetcher from '@/components/Fetchers'
import { PageSkeleton } from '@/components/layout/PageSkeleton'
import UsersTable from '@/components/tables/UsersTable'
import RoleTable from '@/components/tables/RoleTable'
import EditUserModal from '@/components/layout/dashboard/EditUserModal'
import { mutate } from 'swr'
import EditRoleModal from '@/components/layout/dashboard/EditRoleModal'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@/components/helpers/users'
import { Button } from '@/components/ui/button'
import { useSession } from '@/lib/auth-client'

export default function Page() {
    const Router = useRouter()
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()
    // const editUserModal = useDisclosure()
    // const editRoleModal = useDisclosure()

    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()

    const [activeUser, setActiveUser] = useState<UserDataType>({} as UserDataType)
    const [activeRole, setActiveRole] = useState<RoleDataType>({} as RoleDataType)

    const createUser = async () => {
        const user = await DB.createUser(club.id)
        if (user) {
            mutate('/api/GetUsersByClubId')
        } else {
            console.log('could not create user')
        }
    }

    const updateUser = async (user: UserDataType, password: string) => {
        // editUserModal.onClose()
        await DB.updateUser(user)
        mutate('/api/GetUsersByClubId')
    }

    const deleteUser = async (user: UserDataType) => {
        await DB.deleteUser(user)
        mutate('/api/GetUsersByClubId')
    }
    const createRole = async () => {
        const role = await DB.createRole(club.id)
        console.log(role)
        if (role) {
            mutate('/api/GetRolesByClubId')
        } else {
            console.log('could not create role')
        }
    }
    const updateRole = async (role: RoleDataType) => {
        // editRoleModal.onClose()
        await DB.updateRole(role)
        mutate('/api/GetRolesByClubId')
    }

    const deleteRole = async (role: RoleDataType) => {
        await DB.deleteRole(role)
        mutate('/api/GetRolesByClubId')
    }

    const showUserEditModal = async (user: UserDataType) => {
        setActiveUser(user)
        // editUserModal.onOpen()
    }

    const showRoleEditModal = async (role: RoleDataType) => {
        setActiveRole(role)
        // editRoleModal.onOpen()
    }

    if (clubIsValidating || club == undefined || session == undefined) {
        return <PageSkeleton />
    }

    if (userHasPermission(session.user, AVAILABLE_PERMISSIONS.viewUsers)) {
        return (
            <>
                <div className='p-6'>
                    Users
                    <UsersTable edit={showUserEditModal} deleteUser={deleteUser} />
                    {userHasPermission(session.user, AVAILABLE_PERMISSIONS.editUsers) ? <Button onClick={createUser}>Create User</Button> : <></>}
                </div>
                <div className='p-6'>
                    Roles
                    <RoleTable edit={showRoleEditModal} deleteRole={deleteRole} />
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
