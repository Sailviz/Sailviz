import { Button } from '@components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@components/ui/dialog'
import { Input } from '@components/ui/input'
import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import * as Types from '@sailviz/types'
import { Switch } from '@components/ui/switch'

export default function EditBuoyDialog({ buoy, open, onClose }: { buoy: Types.BuoyType | undefined; open: boolean; onClose?: () => void }) {
    const [name, setName] = useState('')
    const [isMoveable, setIsMoveable] = useState(false)
    const [lat, setLat] = useState(0)
    const [lon, setLon] = useState(0)
    const [trackerId, setTrackerId] = useState('')

    const buoyUpdateMutation = useMutation(orpcClient.buoy.update.mutationOptions())
    const boatDeleteMutation = useMutation(orpcClient.buoy.delete.mutationOptions())
    const queryClient = useQueryClient()

    const editBuoy = async (buoy: Types.BuoyType) => {
        await buoyUpdateMutation.mutateAsync(buoy)
        queryClient.invalidateQueries({
            queryKey: orpcClient.buoy.session.key({ type: 'query' })
        })
        onClose && onClose()
    }

    const deleteBuoy = (buoyId: string) => async () => {
        if (confirm('Are you sure you want to remove customisations?')) {
            await boatDeleteMutation.mutateAsync({ boatId: buoyId })
            queryClient.invalidateQueries({
                queryKey: orpcClient.buoy.session.key({ type: 'query' })
            })
            onClose && onClose()
        }
    }

    useEffect(() => {
        if (buoy === undefined) return
        setName(buoy.name)
        setIsMoveable(buoy.isMoveable)
        setLat(buoy.lat)
        setLon(buoy.lon)
        setTrackerId(buoy.trackerId || '')
    }, [buoy])

    return (
        <Dialog open={open} onOpenChange={open ? onClose : undefined}>
            <DialogContent className='max-w-8/12'>
                <DialogTitle className='flex flex-col gap-1'>Edit Buoy</DialogTitle>
                <div className='flex w-full'>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Name</p>

                        <Input id='name' disabled type='text' value={name} onChange={e => setName(e.target.value)} placeholder='J Bloggs' autoComplete='off' />
                    </div>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Lat</p>
                        <Input id='py' type='number' value={lat.toString()} onChange={e => setLat(parseInt(e.target.value))} autoComplete='off' />
                    </div>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Lon</p>
                        <Input id='crew' disabled type='number' value={lon.toString()} onChange={e => setLon(parseInt(e.target.value))} autoComplete='off' />
                    </div>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-xl font-bold'>Moveable</p>
                        <Switch checked={isMoveable} onCheckedChange={setIsMoveable} className='mt-2' />
                    </div>
                    {isMoveable ? (
                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-xl font-bold'>TrackerId</p>
                            <Input id='starttime' type='number' value={trackerId} onChange={e => setTrackerId(e.target.value)} autoComplete='off' />
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
                <DialogFooter>
                    <Button variant={'red'} onClick={deleteBuoy(buoy?.id || '')}>
                        Delete Buoy
                    </Button>
                    <Button onClick={() => editBuoy({ ...buoy!, name, lat, lon, trackerId, isMoveable })}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
