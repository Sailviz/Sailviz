import { Button } from '@components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@components/ui/dialog'
import { Input } from '@components/ui/input'
import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import * as Types from '@sailviz/types'

export default function EditBoatDialog({ boat, open, onClose }: { boat: Types.BoatType | undefined; open: boolean; onClose?: () => void }) {
    const [boatName, setBoatName] = useState('')
    const [PY, setPY] = useState(0)
    const [Crew, setCrew] = useState(0)
    const [pursuitStartTime, setPursuitStartTime] = useState(0)

    const boatUpdateMutation = useMutation(orpcClient.boat.org.update.mutationOptions())
    const boatDeleteMutation = useMutation(orpcClient.boat.org.delete.mutationOptions())
    const queryClient = useQueryClient()

    const editBoat = async (boat: Types.BoatType) => {
        await boatUpdateMutation.mutateAsync(boat)
        queryClient.invalidateQueries({
            queryKey: orpcClient.boat.org.session.key({ type: 'query' })
        })
        onClose && onClose()
    }

    const deleteBoat = (boatId: string) => async () => {
        if (confirm('Are you sure you want to remove customisations?')) {
            await boatDeleteMutation.mutateAsync({ boatId: boatId })
            queryClient.invalidateQueries({
                queryKey: orpcClient.boat.org.session.key({ type: 'query' })
            })
            onClose && onClose()
        }
    }

    useEffect(() => {
        if (boat === undefined) return
        setBoatName(boat.name)
        setPY(boat.py)
        setPursuitStartTime(boat.pursuitStartTime)
        setCrew(boat.crew)
    }, [boat])

    return (
        <Dialog open={open} onOpenChange={open ? onClose : undefined}>
            <DialogContent className='max-w-8/12'>
                <DialogTitle className='flex flex-col gap-1'>Edit Boat</DialogTitle>
                <div className='flex w-full'>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Name</p>

                        <Input id='name' disabled type='text' value={boatName} onChange={e => setBoatName(e.target.value)} placeholder='J Bloggs' autoComplete='off' />
                    </div>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>PY</p>
                        <Input id='py' type='number' value={PY.toString()} onChange={e => setPY(parseInt(e.target.value))} autoComplete='off' />
                    </div>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Crew</p>
                        <Input id='crew' disabled type='number' value={Crew.toString()} onChange={e => setCrew(parseInt(e.target.value))} autoComplete='off' />
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
                    <Button variant={'red'} onClick={deleteBoat(boat?.id || '')}>
                        Remove Customisations
                    </Button>
                    <Button onClick={() => editBoat({ ...boat!, name: boatName, py: PY, crew: Crew, pursuitStartTime: pursuitStartTime })}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
