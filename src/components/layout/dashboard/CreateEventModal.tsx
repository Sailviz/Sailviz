'use client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useTheme } from 'next-themes'
import { ChangeEvent, useEffect, useState } from 'react'

export default function CreateEventDialog({ isOpen, onSubmit, onClose }: { isOpen: boolean; onSubmit: (name: string, numberOfRaces: number) => void; onClose: () => void }) {
    const [name, setName] = useState('')
    const [numberOfRaces, setNumberOfRaces] = useState(0)

    const { theme, setTheme } = useTheme()

    return (
        <Dialog>
            <DialogContent>
                <DialogHeader className='flex flex-col gap-1'>Create New Event</DialogHeader>
                <div className='flex w-full'>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Name</p>

                        <Input id='name' type='text' value={name} onChange={e => setName(e.target.value)} autoComplete='off' />
                    </div>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Number Of Races</p>
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
                    <Button color='danger' onClick={onClose}>
                        Close
                    </Button>
                    <Button color='primary' onClick={() => onSubmit(name, numberOfRaces)}>
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
