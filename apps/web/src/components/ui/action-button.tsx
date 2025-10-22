import { useState } from 'react'
import { CheckIcon, LoaderIcon } from 'lucide-react'
import { Button } from '@components/ui/button'

export function ActionButton({
    action,
    before,
    during,
    after,
    variant
}: {
    before: string
    during: string
    after: string
    action: () => Promise<void>
    variant?: 'default' | 'red' | 'outline' | 'secondary' | 'ghost' | 'link' | 'green' | 'blue' | 'warning'
}) {
    const [isSaving, setIsSaving] = useState(false)
    const [isSaved, setIsSaved] = useState(false)

    const handleClick = async () => {
        setIsSaving(true)
        setIsSaved(false)

        try {
            await action()
            setIsSaved(true)
        } catch (err) {
            console.error(before, ' failed:', err)
        } finally {
            setIsSaving(false)
            setTimeout(() => setIsSaved(false), 2000) // reset tick
        }
    }

    return (
        <Button onClick={handleClick} disabled={isSaving} variant={variant}>
            {isSaving ? <LoaderIcon className='mr-2 h-4 w-4 animate-spin' /> : isSaved ? <CheckIcon className='mr-2 h-4 w-4 text-green-500' /> : null}
            {isSaving ? during : isSaved ? after : before}
        </Button>
    )
}
