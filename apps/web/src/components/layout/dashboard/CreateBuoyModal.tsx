import { useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import { Switch } from '@components/ui/switch'

export default function CreateBuoyDialog() {
    const createBuoyMutation = useMutation(orpcClient.buoy.create.mutationOptions())
    const queryClient = useQueryClient()

    const [name, setName] = useState('')
    const [isMoveable, setIsMoveable] = useState(false)
    const [isStartLine, setIsStartLine] = useState(false)

    const [open, setOpen] = useState(false)

    const createBoat = async () => {
        await createBuoyMutation.mutateAsync({
            name,
            isMoveable,
            isStartLine
        })
        queryClient.invalidateQueries({
            queryKey: orpcClient.buoy.session.key({ type: 'query' })
        })
        setOpen(false)
    }

    const clearFields = () => {
        setName('')
        setIsMoveable(false)
        setIsStartLine(false)
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
                <Button>Create New Buoy</Button>
            </DialogTrigger>
            <DialogContent className='max-w-8/12'>
                <DialogHeader className='flex flex-col gap-1'>Edit Buoy</DialogHeader>
                <div className='flex w-full'>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Name</p>

                        <Input id='name' type='text' value={name} onChange={e => setName(e.target.value)} autoComplete='off' />
                    </div>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Moveable</p>
                        <Switch checked={isMoveable} onCheckedChange={setIsMoveable} className='mt-2' />
                    </div>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>StartLine</p>
                        <Switch checked={isStartLine} onCheckedChange={setIsStartLine} className='mt-2' />
                    </div>
                </div>
                <DialogFooter>
                    <Button color='primary' onClick={() => createBoat()}>
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
