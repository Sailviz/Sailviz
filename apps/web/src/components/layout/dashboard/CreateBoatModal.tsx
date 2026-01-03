import { useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { useLoaderData } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import * as Types from '@sailviz/types'

export default function CreateBoatDialog() {
    const session = useLoaderData({ from: `__root__` })

    const createBoatMutation = useMutation(orpcClient.boat.create.mutationOptions())
    const queryClient = useQueryClient()

    const [boatName, setBoatName] = useState('')
    const [PY, setPY] = useState(0)
    const [Crew, setCrew] = useState(0)
    const [pursuitStartTime, setPursuitStartTime] = useState(0)

    const [open, setOpen] = useState(false)

    const createBoat = async (boat: Types.BoatType) => {
        await createBoatMutation.mutateAsync({
            name: boat.name,
            crew: boat.crew,
            py: boat.py,
            pursuitStartTime: boat.pursuitStartTime,
            orgId: session!.user.clubId
        })
        queryClient.invalidateQueries({
            queryKey: orpcClient.boat.session.key({ type: 'query' })
        })
        setOpen(false)
    }

    const clearFields = () => {
        setBoatName('')
        setPY(0)
        setCrew(0)
        setPursuitStartTime(0)
    }

    return (
        <Dialog
            open={open}
            onOpenChange={open => {
                setOpen(open)
                clearFields()
            }}
        >
            <DialogTrigger asChild aria-label='new boat'>
                <Button>Create New Boat</Button>
            </DialogTrigger>
            <DialogContent className='max-w-8/12'>
                <DialogHeader className='flex flex-col gap-1'>Edit Boat</DialogHeader>
                <div className='flex w-full'>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Name</p>

                        <Input id='name' type='text' value={boatName} onChange={e => setBoatName(e.target.value)} autoComplete='off' />
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
                    <Button color='primary' onClick={() => createBoat({ name: boatName, py: PY, crew: Crew, pursuitStartTime: pursuitStartTime } as Types.BoatType)}>
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
