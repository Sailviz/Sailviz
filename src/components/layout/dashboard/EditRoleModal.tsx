import { ChangeEvent, useEffect, useState } from 'react'
import Select from 'react-select'
import { PERMISSIONS } from '@/components/helpers/users'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import { mutate } from 'swr'

export default function EditRoleModal({ role }: { role: RoleDataType }) {
    const Router = useRouter()
    const [name, setName] = useState('')
    const [permissions, setPermissions] = useState<PermissionType[]>([])

    const [open, setOpen] = useState(true)

    const updateRole = async (role: RoleDataType) => {
        await DB.updateRole(role)
        mutate('/api/GetRolesByClubId')
        Router.back()
    }

    const deleteRole = async (role: RoleDataType) => {
        console.log('deleting role', role)
        if (confirm('Are you sure you want to delete this role?')) {
            await DB.deleteRole(role)
            mutate('/api/GetRolesByClubId')
            Router.back()
        }
    }

    useEffect(() => {
        if (role === undefined) return
        setName(role.name)
        setPermissions(role.permissions?.allowed ?? [])
    }, [role])

    return (
        <Dialog
            open={open}
            onOpenChange={open => {
                setOpen(open)
                if (!open) Router.back() // this catches the x button and clicking outside the modal, gets out of parallel route
            }}
        >
            <DialogContent className='max-w-8/12'>
                <DialogTitle className='flex flex-col gap-1'>Edit Role</DialogTitle>
                <div className='flex w-full'>
                    <div className='flex flex-col px-6 w-1/4'>
                        <p className='hidden' id='EditResultId'></p>
                        <p className='text-2xl font-bold'>Name</p>
                        <Input type='text' value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className='flex flex-col px-6 w-3/4'>
                        <p className='text-2xl font-bold'>Permissions</p>
                        <div className='w-full p-2 mx-0 my-2'>
                            <Select
                                id='editRoles'
                                className=' w-full h-full text-3xl'
                                isMulti={true}
                                options={PERMISSIONS}
                                onChange={e => setPermissions(e.map((x: any) => x))}
                                value={permissions.map((x: PermissionType) => {
                                    return PERMISSIONS.find((y: any) => y.value == x.value)
                                })}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant={'red'} onClick={() => deleteRole(role)}>
                        Remove
                    </Button>
                    <Button color='primary' onClick={() => updateRole({ ...role!, name: name, permissions: { allowed: permissions } })}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
