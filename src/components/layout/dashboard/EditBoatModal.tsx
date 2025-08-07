import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import * as DB from '@/components/apiMethods'
import { mutate } from 'swr'

export default function EditBoatDialog({ boat }: { boat: BoatDataType }) {
    const Router = useRouter()
    const [boatName, setBoatName] = useState('')
    const [PY, setPY] = useState(0)
    const [Crew, setCrew] = useState(0)
    const [pursuitStartTime, setPursuitStartTime] = useState(0)

    const [open, setOpen] = useState(true)

    const editBoat = async (boat: BoatDataType) => {
        await DB.updateBoatById(boat)
        mutate('/api/GetBoats')
        Router.back()
    }

    const deleteBoat = (boatId: string) => async () => {
        if (confirm('Are you sure you want to delete this boat?')) {
            await DB.deleteBoatById(boatId)
            mutate('/api/GetBoats')
            Router.back()
        }
    }

    useEffect(() => {
        if (boat === undefined) return
        setBoatName(boat.name)
        setPY(boat.py)
        setCrew(boat.crew)
        setPursuitStartTime(boat.pursuitStartTime)
    }, [boat])

    return (
        <Dialog
            open={open}
            onOpenChange={open => {
                setOpen(open)
                if (!open) Router.back() // this catches the x button and clicking outside the modal, gets out of parallel route
            }}
        >
            <DialogContent className='max-w-8/12'>
                <DialogHeader className='flex flex-col gap-1'>Edit Boat</DialogHeader>
                <div className='flex w-full'>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Name</p>

                        <Input id='name' type='text' value={boatName} onChange={e => setBoatName(e.target.value)} placeholder='J Bloggs' autoComplete='off' />
                    </div>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>PY</p>
                        <Input id='py' type='number' value={PY.toString()} onChange={e => setPY(parseInt(e.target.value))} autoComplete='off' />
                    </div>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Crew</p>
                        <Input id='crew' type='number' value={Crew.toString()} onChange={e => setCrew(parseInt(e.target.value))} autoComplete='off' />
                    </div>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-xl font-bold'>Pursuit Start Time (s)</p>
                        <Input
                            id='starttime'
                            type='number'
                            value={pursuitStartTime.toString()}
                            onChange={e => setPursuitStartTime(parseInt(e.target.value))}
                            autoComplete='off'
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant={'red'} onClick={deleteBoat(boat.id)}>
                        Delete
                    </Button>
                    <Button onClick={() => editBoat({ ...boat!, name: boatName, py: PY, crew: Crew, pursuitStartTime: pursuitStartTime })}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
