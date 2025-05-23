import { useTheme } from 'next-themes'
import { ChangeEvent, useEffect, useState } from 'react'
import Select from 'react-select'
import * as Fetcher from '@/components/Fetchers'
import { DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function EditUserDialog({
    isOpen,
    user,
    onSubmit,
    onClose
}: {
    isOpen: boolean
    user: UserDataType | undefined
    onSubmit: (user: UserDataType, password: string) => void
    onClose: () => void
}) {
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { roles: roleOptions, rolesIsError, rolesIsValidating } = Fetcher.Roles(club)

    const [displayName, setDisplayName] = useState('')
    const [username, setUsername] = useState('')
    const [roles, setRoles] = useState<RoleDataType[]>([])
    const [startPage, setStartPage] = useState('')
    const [password, setPassword] = useState('')

    const { theme, setTheme } = useTheme()

    useEffect(() => {
        if (user === undefined) return
        setDisplayName(user.displayName)
        setUsername(user.username)
        setRoles(user.roles)
        setStartPage(user.startPage)
    }, [user])

    return (
        <>
            <DialogContent>
                <DialogHeader className='flex flex-col gap-1'>Edit User</DialogHeader>
                <div className='flex w-full'>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold text-gray-700'>Display Name</p>
                        {/* <Input type='text' value={displayName} onValueChange={setDisplayName} /> */}
                    </div>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold text-gray-700'>username</p>
                        {/* <Input type='text' value={username} onValueChange={setUsername} /> */}
                    </div>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold text-gray-700'>Roles</p>
                        <div className='w-full p-2 mx-0 my-2'>
                            <Select
                                id='editRoles'
                                className=' w-56 h-full text-3xl'
                                isMulti={true}
                                options={roleOptions.map((x: RoleDataType) => {
                                    return { value: x, label: x.name }
                                })}
                                onChange={e => setRoles(e.map((x: any) => x.value))}
                                value={roles?.map((x: RoleDataType) => {
                                    return { value: x, label: x.name }
                                })}
                            />
                        </div>
                    </div>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold text-gray-700'>Start Page</p>

                        {/* <Input type='text' value={startPage} onValueChange={setStartPage} /> */}
                    </div>
                </div>
                <div>
                    <div className='flex flex-col px-6 w-1/4'>
                        <p className='text-2xl font-bold text-gray-700'>Update Password</p>

                        {/* <Input type='password' onValueChange={setPassword} /> */}
                    </div>
                </div>
                <DialogFooter>
                    <Button color='danger' onClick={onClose}>
                        Close
                    </Button>
                    <Button color='primary' onClick={() => onSubmit({ ...user!, displayName: displayName, username: username, roles: roles, startPage: startPage }, password)}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </>
    )
}
