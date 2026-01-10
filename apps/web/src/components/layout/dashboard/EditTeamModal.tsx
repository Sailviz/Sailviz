import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import * as Types from '@sailviz/types'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'

export default function EditTeamDialog({ team, open, onClose }: { team: Types.Team; open: boolean; onClose?: () => void }) {
    const [selectedRole, setSelectedRole] = useState('')

    const roles = ['owner', 'admin', 'team']

    return (
        <Dialog open={open} onOpenChange={open ? onClose : undefined}>
            <DialogContent className='max-w-8/12'>
                <DialogTitle className='flex flex-col gap-1'>Edit Team - {team?.name}</DialogTitle>
                <div className='flex w-full'>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold text-gray-700'>Role</p>

                        <Select
                            onValueChange={value => {
                                console.log('Selected value:', value)
                                setSelectedRole(value)
                            }}
                            value={selectedRole}
                        >
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder='Select a Role' />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role: string) => (
                                    <SelectItem value={role}>{role}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant={'red'}>Remove</Button>
                    <Button color='primary'>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
