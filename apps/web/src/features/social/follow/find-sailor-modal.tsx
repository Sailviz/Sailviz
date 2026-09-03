import { useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { PossibleFollowingTable } from './follow-table'
import { Input } from '@components/ui/input'

export default function FindSailorModal() {
    const [open, setOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState<string | null>(null)

    return (
        <Dialog
            open={open}
            onOpenChange={e => {
                setOpen(e)
            }}
        >
            <DialogTrigger asChild>
                <Button variant={'green'} size={'big'} aria-label='find-friends'>
                    Find Friends
                </Button>
            </DialogTrigger>
            <DialogContent className='max-w-8/12'>
                <DialogHeader className='flex flex-col gap-1'>Sailor Search</DialogHeader>
                <div className='flex w-full flex-col'>
                    <Input placeholder='Search for Sailors' value={searchQuery ?? ''} onChange={e => setSearchQuery(e.target.value)} />
                    <PossibleFollowingTable filters={{ page: 1, searchQuery, tagFilter: null }} />
                </div>
                <div className='mt-4'>{/* Render search results here */}</div>
                <DialogFooter>
                    <Button color='success'>Submit</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
