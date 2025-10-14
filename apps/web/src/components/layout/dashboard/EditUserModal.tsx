import { useEffect, useState } from 'react'
import Select from 'react-select'
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import type { RoleType, UserType } from '@sailviz/types'
import { useMutation } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'

export default function EditUserDialog({ user, clubRoles, open, onClose }: { user: UserType; clubRoles: RoleType[]; open: boolean; onClose?: () => void }) {
    const [displayName, setDisplayName] = useState('')
    const [name, setName] = useState('')
    const [startPage, setStartPage] = useState('')
    const [password, setPassword] = useState('')
    const [roles, setRoles] = useState<RoleType[]>([])

    const updateUserMutation = useMutation(orpcClient.user.update.mutationOptions())
    const deleteUserMutation = useMutation(orpcClient.user.delete.mutationOptions())

    const editUser = async (user: UserType) => {
        await updateUserMutation.mutateAsync(user)
        // mutate('/api/GetUsersByClubId')
        onClose && onClose()
    }

    const deleteUser = async (user: UserType) => {
        if (confirm('Are you sure you want to delete this user?')) {
            await deleteUserMutation.mutateAsync(user)
            // mutate('/api/GetUsersByClubId')
            onClose && onClose()
        }
    }

    useEffect(() => {
        if (user === undefined) return
        setDisplayName(user.displayUsername)
        setName(user.username)
        setRoles(user.roles || [])
        setStartPage(user.startPage)
    }, [user])

    return (
        <Dialog open={open} onOpenChange={open ? onClose : undefined}>
            <DialogContent className='max-w-8/12'>
                <DialogTitle className='flex flex-col gap-1'>Edit User</DialogTitle>
                <div className='flex w-full'>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold text-gray-700'>Display Name</p>
                        <Input type='text' value={displayName} onChange={e => setDisplayName(e.target.value)} />
                    </div>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold text-gray-700'>UserName</p>
                        <Input type='text' value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold text-gray-700'>Roles</p>
                        <div className='w-full p-2 mx-0 my-2'>
                            <Select
                                id='editRoles'
                                className=' w-56 h-full text-3xl'
                                isMulti={true}
                                options={
                                    clubRoles &&
                                    clubRoles.map((x: RoleDataType) => {
                                        return { value: x, label: x.name }
                                    })
                                }
                                onChange={e => setRoles(e.map((x: any) => x.value))}
                                value={roles?.map((x: RoleDataType) => {
                                    return { value: x, label: x.name }
                                })}
                            />
                        </div>
                    </div>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold text-gray-700'>Start Page</p>

                        <Input type='text' value={startPage} onChange={e => setStartPage(e.target.value)} />
                    </div>
                </div>
                <div>
                    <div className='flex flex-col px-6 w-1/4'>
                        <p className='text-2xl font-bold text-gray-700'>Update Password (not functional)</p>

                        <Input type='password' onChange={e => setPassword(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant={'red'} onClick={() => deleteUser(user!)}>
                        Remove
                    </Button>
                    <Button color='primary' onClick={() => editUser({ ...user!, displayUsername: displayName, username: name, roles: roles, startPage: startPage })}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
