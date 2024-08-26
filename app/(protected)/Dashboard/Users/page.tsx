'use client'
import { ChangeEvent, MouseEventHandler, useEffect, useState } from "react"
import { useRouter } from "next/navigation";
import * as DB from 'components/apiMethods';
import * as Fetcher from 'components/Fetchers';
import { PageSkeleton } from 'components/ui/PageSkeleton';
import UsersTable from "components/tables/UsersTable";
import RoleTable from "components/tables/RoleTable";
import EditUserModal from "components/ui/dashboard/EditUserModal";
import { Button, useDisclosure } from "@nextui-org/react";
import { mutate } from "swr";
import EditRoleModal from "components/ui/dashboard/EditRoleModal";
import { AVAILABLE_PERMISSIONS, userHasPermission } from "components/helpers/users";


export default function Page() {
    const Router = useRouter();

    const editUserModal = useDisclosure();
    const editRoleModal = useDisclosure();

    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { user, userIsError, userIsValidating } = Fetcher.UseUser()

    const [activeUser, setActiveUser] = useState<UserDataType>({} as UserDataType)
    const [activeRole, setActiveRole] = useState<RoleDataType>({} as RoleDataType)

    const createUser = async () => {
        mutate('/api/GetUsersByClubId')
        const user = await DB.createUser(club.id)
        if (user) {
            mutate('/api/GetUsersByClubId')
        } else {
            console.log("could not create user")
        }
    }

    const updateUser = async (user: UserDataType, password: string) => {
        mutate('/api/GetUsersByClubId')
        editUserModal.onClose()
        await DB.updateUser(user, password)
        mutate('/api/GetUsersByClubId')
    }

    const deleteUser = async (user: UserDataType) => {
        mutate('/api/GetUsersByClubId')
        await DB.deleteUser(user)
        mutate('/api/GetUsersByClubId')

    }
    const createRole = async () => {
        mutate('/api/GetRolesByClubId')
        const role = await DB.createRole(club.id)
        console.log(role)
        if (role) {
            mutate('/api/GetRolesByClubId')
        } else {
            console.log("could not create role")
        }
    }
    const updateRole = async (role: RoleDataType) => {
        mutate('/api/GetRolesByClubId')
        editRoleModal.onClose()
        await DB.updateRole(role)
        mutate('/api/GetRolesByClubId')
    }

    const deleteRole = async (role: RoleDataType) => {
        mutate('/api/GetRolesByClubId')
        await DB.deleteRole(role)
        mutate('/api/GetRolesByClubId')
    }

    const showUserEditModal = async (user: UserDataType) => {
        setActiveUser(user)
        editUserModal.onOpen()
    }

    const showRoleEditModal = async (role: RoleDataType) => {
        setActiveRole(role)
        editRoleModal.onOpen()
    }

    if (userIsValidating || clubIsValidating || club == undefined || user == undefined) {
        return <PageSkeleton />
    }

    if (userHasPermission(user, AVAILABLE_PERMISSIONS.viewUsers)) {

        return (
            <>
                <EditUserModal isOpen={editUserModal.isOpen} user={activeUser} onSubmit={updateUser} onClose={() => { editUserModal.onClose() }} />
                <EditRoleModal isOpen={editRoleModal.isOpen} role={activeRole} onSubmit={updateRole} onClose={() => { editRoleModal.onClose() }} />
                <div className='p-6'>
                    <UsersTable edit={showUserEditModal} deleteUser={deleteUser} />
                    {userHasPermission(user, AVAILABLE_PERMISSIONS.editUsers) ?
                        <Button onClick={createUser} >
                            Create User
                        </Button>
                        : <></>}
                </div>
                <div className='p-6'>
                    <RoleTable edit={showRoleEditModal} deleteRole={deleteRole} />
                    {userHasPermission(user, AVAILABLE_PERMISSIONS.editRoles) ?
                        <Button onClick={createRole} >
                            Create Role
                        </Button>
                        : <></>}
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