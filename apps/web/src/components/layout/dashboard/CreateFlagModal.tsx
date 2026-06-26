import { useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import * as Types from '@sailviz/types'
import { ImageCategory, ImageUpload, OwnerType } from '@components/ImageUpload'

export default function CreateFlagDialog({ custom }: { custom: boolean }) {
    const createFlagMutation = custom ? useMutation(orpcClient.flag.org.create.mutationOptions()) : useMutation(orpcClient.flag.standard.create.mutationOptions())
    const queryClient = useQueryClient()

    const [name, setName] = useState('')
    const [s3key, setS3key] = useState('')

    const [open, setOpen] = useState(false)

    const imageUrlQuery = useQuery({
        ...orpcClient.image.getURL.queryOptions({ input: { s3key } }),
        enabled: s3key !== ''
    })

    const createFlag = async (flag: Types.Flag) => {
        await createFlagMutation.mutateAsync({
            name: flag.name,
            s3key: flag.s3key
        })
        queryClient.invalidateQueries({
            queryKey: orpcClient.flag.standard.all.key({ type: 'query' })
        })
        queryClient.invalidateQueries({
            queryKey: orpcClient.flag.org.custom.key({ type: 'query' })
        })
        setOpen(false)
    }

    const clearFields = () => {
        setName('')
        setS3key('')
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
                <Button>Upload New Flag</Button>
            </DialogTrigger>
            <DialogContent className='max-w-8/12'>
                <DialogHeader className='flex flex-col gap-1'>New Flag</DialogHeader>
                <div className='flex w-full'>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Name</p>

                        <Input id='name' type='text' value={name} onChange={e => setName(e.target.value)} autoComplete='off' />
                    </div>
                    <ImageUpload buttonText='upload Image' owner={OwnerType.public} category={ImageCategory.flag} s3key={setS3key} />
                    {s3key !== '' && imageUrlQuery.data && <img src={imageUrlQuery.data} alt='' width={200} height={200} className='border-2'></img>}
                </div>
                <DialogFooter>
                    <Button color='primary' onClick={() => createFlag({ name, s3key } as Types.Flag)}>
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
