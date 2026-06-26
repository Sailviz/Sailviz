import { Button } from '@components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@components/ui/dialog'
import { Input } from '@components/ui/input'
import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import * as Types from '@sailviz/types'

export default function EditStandardFlagDialog({ flag, open, onClose }: { flag: Types.Flag | undefined; open: boolean; onClose?: () => void }) {
    const [name, setName] = useState('')
    const [s3key, setS3key] = useState('')

    const flagUpdateMutation = useMutation(orpcClient.flag.standard.update.mutationOptions())
    const flagDeleteMutation = useMutation(orpcClient.flag.standard.delete.mutationOptions())
    const queryClient = useQueryClient()

    const editFlag = async (flag: Types.Flag) => {
        await flagUpdateMutation.mutateAsync(flag)
        queryClient.invalidateQueries({
            queryKey: orpcClient.flag.standard.all.key({ type: 'query' })
        })
        onClose && onClose()
    }

    const deleteFlag = (flagId: string) => async () => {
        if (confirm('Are you sure you want to delete this flag?')) {
            await flagDeleteMutation.mutateAsync({ flagId: flagId })
            queryClient.invalidateQueries({
                queryKey: orpcClient.flag.standard.all.key({ type: 'query' })
            })
            onClose && onClose()
        }
    }

    useEffect(() => {
        if (flag === undefined) return
        setName(flag.name)
        setS3key(flag.s3key)
    }, [flag])

    return (
        <Dialog open={open} onOpenChange={open ? onClose : undefined}>
            <DialogContent className='max-w-8/12'>
                <DialogTitle className='flex flex-col gap-1'>Edit Flag</DialogTitle>
                <div className='flex w-full'>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Name</p>

                        <Input id='name' type='text' value={name} onChange={e => setName(e.target.value)} placeholder='J Bloggs' autoComplete='off' />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant={'red'} onClick={deleteFlag(flag?.id || '')}>
                        Delete
                    </Button>
                    <Button onClick={() => editFlag({ ...flag!, name, s3key })}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
