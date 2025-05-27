import { useTheme } from 'next-themes'
import { ChangeEvent, useEffect, useState } from 'react'
import Select from 'react-select'
import * as Fetcher from '@/components/Fetchers'
import { PERMISSIONS } from '@/components/helpers/users'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

export default function EditUserDialog({ role, onSubmit }: { role: RoleDataType | undefined; onSubmit: (role: RoleDataType) => void }) {
    const Router = useRouter()
    const [name, setName] = useState('')
    const [permissions, setPermissions] = useState<PermissionType[]>([])

    const [open, setOpen] = useState(true)

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
                <DialogHeader className='flex flex-col gap-1'>Edit Role</DialogHeader>
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
                    <Button color='primary' onClick={() => onSubmit({ ...role!, name: name, permissions: { allowed: permissions } })}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
