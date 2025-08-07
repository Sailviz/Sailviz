'use client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { redirect } from 'next/dist/server/api-utils'
import { ChangeEvent, useState } from 'react'

export default function CreateSeriesDialog({ onSubmit, allowCreate }: { onSubmit: (name: string) => void; allowCreate?: boolean }) {
    const [seriesName, setSeriesName] = useState('')
    const [open, setOpen] = useState(false)
    console.log('Allow Create:', allowCreate)
    return (
        <>
            <Dialog
                open={open}
                onOpenChange={open => {
                    setOpen(open)
                }}
            >
                <DialogTrigger asChild>
                    <Button aria-label='new series' disabled={!allowCreate}>
                        Create New Series
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader className='flex flex-col gap-1'>Create Series</DialogHeader>

                    <div className='flex w-full'>
                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold'>Name</p>

                            <Input id='name' type='text' value={seriesName} onChange={e => setSeriesName(e.target.value)} placeholder='Name' autoComplete='off' />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            color='primary'
                            onClick={() => {
                                onSubmit(seriesName)
                                setOpen(false)
                            }}
                        >
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
