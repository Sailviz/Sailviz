import { useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from '@components/ui/dialog'
import { Input } from '@components/ui/input'
import { Button } from '@components/ui/button'
import { client } from '@sailviz/auth/client'

export default function CreateTeamModal({ orgId }: { orgId: string }) {
    const [teamName, setTeamName] = useState('')
    const [open, setOpen] = useState(false)

    const Submit = async () => {
        console.log('submitting')

        await client.organization.createTeam({
            name: teamName,
            organizationId: orgId
        })

        setOpen(false)
    }

    const clearFields = async () => {
        console.log('clearing fields')
        setTeamName('')
    }

    return (
        <Dialog
            open={open}
            onOpenChange={e => {
                clearFields()
                setOpen(e)
            }}
        >
            <DialogTrigger asChild>
                <Button aria-label='create new team'>Create New Team</Button>
            </DialogTrigger>
            <DialogContent className='max-w-8/12'>
                <DialogHeader className='flex flex-col gap-1'>Create New Team</DialogHeader>
                <div className='flex w-full'>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Name</p>

                        <Input
                            id='teamName'
                            type='text'
                            value={teamName}
                            onChange={e => {
                                setTeamName(e.target.value)
                            }}
                            placeholder='J Bloggs'
                            autoComplete='off'
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button color='success' onClick={Submit}>
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
