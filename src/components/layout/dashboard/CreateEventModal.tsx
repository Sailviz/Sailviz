'use client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import * as DB from '@/components/apiMethods'
import { mutate } from 'swr'
import { useSession } from '@/lib/auth-client'

export default function CreateEventDialog() {
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()

    const [name, setName] = useState('')
    const [numberOfRaces, setNumberOfRaces] = useState(0)

    const [open, setOpen] = useState(false)

    const createEvent = async (name: string, numberOfRaces: number) => {
        if (!session?.club) {
            throw new Error('No club found in session')
        }
        const series = await DB.createSeries(session.club.id, name)
        for (let i = 0; i < numberOfRaces; i++) {
            await DB.createRace(session.club.id, series.id)
        }
        mutate('/api/GetTodaysRaceByClubId')
        setOpen(false)
    }

    return (
        <Dialog
            open={open}
            onOpenChange={open => {
                setOpen(open)
            }}
        >
            <DialogTrigger asChild aria-label='new event'>
                <Button>Create New Event</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader className='flex flex-col gap-1'>Create New Event</DialogHeader>
                <div className='flex w-full'>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Name</p>

                        <Input id='name' type='text' value={name} onChange={e => setName(e.target.value)} autoComplete='off' />
                    </div>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold whitespace-nowrap'>Number Of Races</p>
                        <Input
                            id='numberOfRaces'
                            type='number'
                            value={numberOfRaces.toString()}
                            onChange={e => setNumberOfRaces(parseInt(e.target.value))}
                            autoComplete='off'
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button color='primary' onClick={() => createEvent(name, numberOfRaces)}>
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
