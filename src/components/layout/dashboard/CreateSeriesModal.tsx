import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { redirect } from 'next/dist/server/api-utils'
import { useRouter } from 'next/navigation'
import { ChangeEvent, useState } from 'react'

export default function CreateSeriesDialog({ onSubmit, onClose }: { onSubmit: (name: string) => void; onClose: () => void }) {
    const [seriesName, setSeriesName] = useState('')
    const [open, setOpen] = useState(true)
    const Router = useRouter()
    return (
        <>
            <Dialog
                open={open}
                onOpenChange={open => {
                    setOpen(open)
                    if (!open) Router.back() // this catches the x button and clicking outside the modal, gets out of parallel route
                }}
            >
                <DialogContent>
                    <DialogHeader className='flex flex-col gap-1'>Create Series</DialogHeader>

                    <div className='flex w-full'>
                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold'>Name</p>

                            <Input id='name' type='text' value={seriesName} onChange={e => setSeriesName(e.target.value)} placeholder='Name' autoComplete='off' />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button color='danger' onClick={onClose}>
                            Close
                        </Button>
                        <Button color='primary' onClick={() => onSubmit(seriesName)}>
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
