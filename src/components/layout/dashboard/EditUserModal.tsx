import { useTheme } from 'next-themes'
import { ChangeEvent, useEffect, useState } from 'react'
import Select from 'react-select'
import * as Fetcher from '@/components/Fetchers'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

export default function EditUserDialog({ user, onSubmit }: { user: UserDataType | undefined; onSubmit: (user: UserDataType, password: string) => void }) {
    const Router = useRouter()
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { roles: roleOptions, rolesIsError, rolesIsValidating } = Fetcher.Roles(club)

    const [open, setOpen] = useState(true)

    const [displayName, setDisplayName] = useState('')
    const [name, setName] = useState('')
    const [roles, setRoles] = useState<RoleDataType[]>([])
    const [startPage, setStartPage] = useState('')
    const [password, setPassword] = useState('')

    const { theme, setTheme } = useTheme()

    useEffect(() => {
        if (user === undefined) return
        setDisplayName(user.displayName)
        setName(user.name)
        setRoles(user.roles)
        setStartPage(user.startPage)
    }, [user])

    return (
        <Dialog
            open={open}
            onOpenChange={open => {
                setOpen(open)
                if (!open) Router.back() // this catches the x button and clicking outside the modal, gets out of parallel route
            }}
        >
            <DialogContent className='max-w-8/12'>
                <DialogHeader className='flex flex-col gap-1'>Edit User</DialogHeader>
                <div className='flex w-full'>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold text-gray-700'>Display Name</p>
                        <Input type='text' value={displayName} onChange={e => setDisplayName(e.target.value)} />
                    </div>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold text-gray-700'>name</p>
                        <Input type='text' value={name} onChange={e => setName(e.target.value)} />
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

                        <Input type='text' value={startPage} onChange={e => setStartPage(e.target.value)} />
                    </div>
                </div>
                <div>
                    <div className='flex flex-col px-6 w-1/4'>
                        <p className='text-2xl font-bold text-gray-700'>Update Password</p>

                        <Input type='password' onChange={e => setPassword(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button color='primary' onClick={() => onSubmit({ ...user!, displayName: displayName, name: name, roles: roles, startPage: startPage }, password)}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
