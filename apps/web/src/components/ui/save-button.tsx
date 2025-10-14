import { useState } from 'react'
import { CheckIcon, LoaderIcon } from 'lucide-react'
import { Button } from '@components/ui/button'

export function SaveButton({ onSave }: { onSave: () => Promise<void> }) {
    const [isSaving, setIsSaving] = useState(false)
    const [isSaved, setIsSaved] = useState(false)

    const handleClick = async () => {
        setIsSaving(true)
        setIsSaved(false)

        try {
            await onSave()
            setIsSaved(true)
        } catch (err) {
            console.error('Save failed:', err)
        } finally {
            setIsSaving(false)
            setTimeout(() => setIsSaved(false), 2000) // reset tick
        }
    }

    return (
        <Button onClick={handleClick} disabled={isSaving}>
            {isSaving ? <LoaderIcon className='mr-2 h-4 w-4 animate-spin' /> : isSaved ? <CheckIcon className='mr-2 h-4 w-4 text-green-500' /> : null}
            {isSaving ? 'Saving...' : isSaved ? 'Saved!' : 'Save'}
        </Button>
    )
}
