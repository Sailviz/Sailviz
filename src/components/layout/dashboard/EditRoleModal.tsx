import { useTheme } from 'next-themes'
import { ChangeEvent, useEffect, useState } from 'react'
import Select from 'react-select'
import * as Fetcher from '@/components/Fetchers'
import { PERMISSIONS } from '@/components/helpers/users'
import { DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function EditUserDialog({
    isOpen,
    role,
    onSubmit,
    onClose
}: {
    isOpen: boolean
    role: RoleDataType | undefined
    onSubmit: (role: RoleDataType) => void
    onClose: () => void
}) {
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()

    const [name, setName] = useState('')
    const [permissions, setPermissions] = useState<PermissionType[]>([])

    const { theme, setTheme } = useTheme()

    useEffect(() => {
        if (role === undefined) return
        setName(role.name)
        setPermissions(role.permissions?.allowed ?? [])
    }, [role])

    return (
        <>
            <DialogContent>
                <DialogHeader className='flex flex-col gap-1'>Edit Role</DialogHeader>
                <div className='flex w-full'>
                    <div className='flex flex-col px-6 w-1/4'>
                        <p className='hidden' id='EditResultId'></p>
                        <p className='text-2xl font-bold'>Name</p>
                        {/* <Input type='text' value={name} onValueChange={setName} /> */}
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
                    <Button color='danger' onClick={onClose}>
                        Close
                    </Button>
                    <Button color='primary' onClick={() => onSubmit({ ...role!, name: name, permissions: { allowed: permissions } })}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </>
    )
}
