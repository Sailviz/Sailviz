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

    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()

    const createUser = async () => {
        const user = await DB.createUser(club.id)
        if (user) {
            mutate('/api/GetUsersByClubId')
        } else {
            console.log('could not create user')
        }
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

    if (clubIsValidating || club == undefined || session == undefined) {
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
