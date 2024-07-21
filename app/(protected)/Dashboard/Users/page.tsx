'use client'
import { ChangeEvent, MouseEventHandler, useEffect, useState } from "react"
import { useRouter } from "next/navigation";
import * as DB from 'components/apiMethods';
import * as Fetcher from 'components/Fetchers';
import { PageSkeleton } from 'components/ui/PageSkeleton';
import UsersTable from "components/tables/UsersTable";
import RoleTable from "components/tables/RoleTable";
import Select from 'react-select';
import { PERMISSIONS } from 'components/helpers/users';


export default function Page() {
    const Router = useRouter();

    const { user, userIsError, userIsValidating } = Fetcher.UseUser()
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { users, usersIsError, usersIsValidating } = Fetcher.Users(club)
    const { roles, rolesIsError, rolesIsValidating } = Fetcher.Roles(club)

    const [activeUser, setActiveUser] = useState<UserDataType>({} as UserDataType)
    const [activeRole, setActiveRole] = useState<RoleDataType>({} as RoleDataType)

    const createUser = async () => {
        const user = await DB.createUser(club.id)
        if (user) {
            // setUsers(users.concat(user))
        } else {
            console.log("could not create user")
        }
    }

    const updateUser = async () => {
        console.log(activeUser)
        await DB.updateUser(activeUser)
        // setUsers(await DB.GetUsersByClubId(club.id))
    }

    const deleteUser = async () => {
        console.log(activeUser)
        await DB.deleteUser(activeUser)
        // setUsers(await DB.GetUsersByClubId(club.id))
    }
    const createRole = async () => {
        const role = await DB.createRole(club.id)
        if (role) {
            // setRoles(roles.concat(role))
        } else {
            console.log("could not create role")
        }
    }
    const updateRole = async () => {
        console.log(activeRole)
        await DB.updateRole(activeRole)
        // setRoles(await DB.GetRolesByClubId(club.id))
    }

    const deleteRole = async () => {
        console.log(activeRole)
        await DB.deleteRole(activeRole)
        // setRoles(await DB.GetRolesByClubId(club.id))
    }

    const showUserEditModal = async (userId: string) => {
        setActiveUser(users.find(x => x.id == userId) as UserDataType)
        document.getElementById("userEditModal")!.classList.remove("hidden")
    }

    const showRoleEditModal = async (roleId: string) => {
        setActiveRole(roles.find(x => x.id == roleId) as RoleDataType)
        document.getElementById("roleEditModal")!.classList.remove("hidden")
    }

    if (usersIsValidating || usersIsError || users == undefined || rolesIsValidating || rolesIsError || roles == undefined) {
        return <PageSkeleton />
    }
    return (
        <>
            <div id="userEditModal" className={"fixed z-10 left-0 top-0 w-full h-full overflow-auto bg-gray-400 backdrop-blur-sm bg-opacity-20 hidden"}>
                <div className="mx-40 my-20 px-10 py-5 border w-4/5 bg-gray-300 rounded-sm" >
                    <div className="text-6xl font-extrabold text-gray-700 p-6 float-right cursor-pointer" onClick={() => { document.getElementById("userEditModal")!.classList.add("hidden") }}>&times;</div>
                    <div className="text-6xl font-extrabold text-gray-700 p-6">Edit User</div>
                    <div className="flex w-3/4">
                        <div className='flex flex-col px-6 w-full'>
                            <p className='hidden' id="EditResultId">

                            </p>
                            <p className='text-2xl font-bold text-gray-700'>
                                Display Name
                            </p>
                            <input type="text" id="editHelm" className="h-full text-2xl p-4" value={activeUser.displayName} onChange={(e) => setActiveUser({ ...activeUser, displayName: e.target.value })} />
                        </div>
                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold text-gray-700'>
                                username
                            </p>

                            <input type="text" id="editCrew" className="h-full text-2xl p-4" value={activeUser.username} onChange={(e) => setActiveUser({ ...activeUser, username: e.target.value })} />
                        </div>
                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold text-gray-700'>
                                Roles
                            </p>
                            <div className="w-full p-2 mx-0 my-2">
                                <Select
                                    id="editRoles"
                                    className=' w-56 h-full text-3xl'
                                    isMulti={true}
                                    options={roles.map((x: RoleDataType) => { return { value: x, label: x.name } }) as any}
                                    onChange={(e) => setActiveUser({ ...activeUser, roles: e.map((x: any) => x.value) }) as any}
                                    value={activeUser.roles?.map((x: RoleDataType) => { return { value: x, label: x.name } }) as any}
                                />
                            </div>
                        </div>
                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold text-gray-700'>
                                Start Page
                            </p>

                            <input type="text" id="editStartPage" className="h-full text-2xl p-4" value={activeUser.startPage} onChange={(e) => setActiveUser({ ...activeUser, startPage: e.target.value })} />

                        </div>
                    </div>

                    <div className="flex flex-row justify-end">
                        <div className=" flex justify-end mt-8">
                            <div className="p-4 mr-2">
                                <p id="confirmRemove" onClick={() => { deleteUser(); document.getElementById("userEditModal")!.classList.add("hidden") }} className="cursor-pointer text-white bg-red-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-xl text-lg px-12 py-4 text-center mr-3 md:mr-0">
                                    Remove
                                </p>
                            </div>
                        </div>
                        <div className=" flex justify-end mt-8">
                            <div className="p-4 mr-2">
                                <p id="confirmEdit" onClick={() => { updateUser(); document.getElementById("userEditModal")!.classList.add("hidden") }} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xl px-12 py-4 text-center mr-3 md:mr-0">
                                    update
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="roleEditModal" className={"fixed z-10 left-0 top-0 w-full h-full overflow-auto bg-gray-400 backdrop-blur-sm bg-opacity-20 hidden"}>
                <div className="mx-40 my-20 px-10 py-5 border w-4/5 bg-gray-300 rounded-sm" >
                    <div className="text-6xl font-extrabold text-gray-700 p-6 float-right cursor-pointer" onClick={() => { document.getElementById("roleEditModal")!.classList.add("hidden") }}>&times;</div>
                    <div className="text-6xl font-extrabold text-gray-700 p-6">Edit User</div>
                    <div className="flex w-3/4">
                        <div className='flex flex-col px-6 w-full'>
                            <p className='hidden' id="EditResultId">

                            </p>
                            <p className='text-2xl font-bold text-gray-700'>
                                Name
                            </p>
                            <input type="text" id="editHelm" className="h-full text-2xl p-4" value={activeRole.name} onChange={(e) => setActiveRole({ ...activeRole, name: e.target.value })} />
                        </div>
                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold text-gray-700'>
                                Permissions
                            </p>
                            <div className="w-full p-2 mx-0 my-2">
                                <Select
                                    id="editRoles"
                                    className=' w-56 h-full text-3xl'
                                    isMulti={true}
                                    options={PERMISSIONS}
                                    onChange={(e) => setActiveRole({ ...activeRole, permissions: { allowed: e.map((x: any) => x) } })}
                                    value={activeRole.permissions?.allowed?.map((x: PermissionType) => { return PERMISSIONS.find((y: any) => y.value == x.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-row justify-end">
                        <div className=" flex justify-end mt-8">
                            <div className="p-4 mr-2">
                                <p id="confirmRemove" onClick={() => { deleteRole(); document.getElementById("roleEditModal")!.classList.add("hidden") }} className="cursor-pointer text-white bg-red-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-xl text-lg px-12 py-4 text-center mr-3 md:mr-0">
                                    Remove
                                </p>
                            </div>
                        </div>
                        <div className=" flex justify-end mt-8">
                            <div className="p-4 mr-2">
                                <p id="confirmEdit" onClick={() => { updateRole(); document.getElementById("roleEditModal")!.classList.add("hidden") }} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xl px-12 py-4 text-center mr-3 md:mr-0">
                                    update
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='p-6'>
                <UsersTable data={users} key={JSON.stringify(users)} edit={showUserEditModal} />
                <div className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-md px-5 py-2.5 text-center mr-3 md:mr-0 font-extrabold tracking-wide"
                    onClick={createUser}
                >
                    Create User
                </div>
            </div>
            <div className='p-6'>
                <RoleTable data={roles} key={JSON.stringify(roles)} edit={showRoleEditModal} />
                <div className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-md px-5 py-2.5 text-center mr-3 md:mr-0 font-extrabold tracking-wide"
                    onClick={createRole}
                >
                    Create Role
                </div>
            </div>
        </>
    )
}