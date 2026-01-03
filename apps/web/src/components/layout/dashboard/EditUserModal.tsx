import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import type { UserType } from '@sailviz/types'
import { useMutation } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'

export default function EditUserDialog({ user, open, onClose }: { user: UserType; open: boolean; onClose?: () => void }) {
    const [name, setName] = useState('')
    const [startPage, setStartPage] = useState('')

    const updateUserMutation = useMutation(orpcClient.user.update.mutationOptions())
    const deleteUserMutation = useMutation(orpcClient.user.delete.mutationOptions())

    const editUser = async (user: UserType) => {
        await updateUserMutation.mutateAsync(user)
        onClose && onClose()
    }

    const deleteUser = async (user: UserType) => {
        if (confirm('Are you sure you want to delete this user?')) {
            await deleteUserMutation.mutateAsync(user)
            onClose && onClose()
        }
    }

    useEffect(() => {
        if (user === undefined) return
        setName(user.name)
        setStartPage(user.startPage)
    }, [user])

    return (
        <Dialog open={open} onOpenChange={open ? onClose : undefined}>
            <DialogContent className='max-w-8/12'>
                <DialogTitle className='flex flex-col gap-1'>Edit User</DialogTitle>
                <div className='flex w-full'>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold text-gray-700'>UserName</p>
                        <Input type='text' value={name} onChange={e => setName(e.target.value)} />
                    </div>

                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold text-gray-700'>Start Page</p>

                        <Input type='text' value={startPage} onChange={e => setStartPage(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant={'red'} onClick={() => deleteUser(user!)}>
                        Remove
                    </Button>
                    <Button color='primary' onClick={() => editUser({ ...user!, name: name, startPage: startPage })}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
