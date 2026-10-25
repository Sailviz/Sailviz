import { Edit2, Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import * as Types from '@sailviz/types'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Textarea } from '@components/ui/textarea'

export function ActivityHeader({ activity, onSave }: { activity: Types.Activity; onSave: (title: string, description: string) => void }) {
    const [editing, setEditing] = useState(false)
    const [title, setTitle] = useState(activity?.title ?? '')
    const [description, setDescription] = useState(activity?.description ?? '')

    const handleSave = () => {
        onSave(title, description)
        setEditing(false)
    }

    useEffect(() => {
        setTitle(activity?.title ?? '')
        setDescription(activity?.description ?? '')
    }, [activity])

    return (
        <div className='group relative'>
            {!editing ? (
                <div className='flex items-start gap-2'>
                    <div className='flex-1'>
                        <h2 className='text-3xl font-bold tracking-tight'>{activity?.title}</h2>
                        <p className='text-sm text-muted-foreground'>{activity?.description}</p>
                    </div>

                    <Button onClick={() => setEditing(true)} className=''>
                        <Edit2 className='h-4 w-4 text-muted-foreground hover:text-foreground' />
                    </Button>
                </div>
            ) : (
                <div className='flex items-start gap-2'>
                    <div className='flex-1 space-y-2' key={activity.id}>
                        <Input value={title} onChange={e => setTitle(e.target.value)} className='w-full rounded-md border px-3 py-2 text-3xl font-bold' />

                        <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className='w-full rounded-md border px-3 py-2 text-sm' />
                    </div>

                    <Button onClick={handleSave} className='rounded-md border p-2 hover:bg-muted'>
                        <Check className='h-4 w-4' />
                    </Button>
                    <Button onClick={() => setEditing(false)} className='rounded-md border p-2 hover:bg-muted'>
                        Cancel
                    </Button>
                </div>
            )}
        </div>
    )
}
