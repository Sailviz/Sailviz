'use client'
import { DialogContent } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { useTheme } from 'next-themes'
import { ChangeEvent, useState } from 'react'

export default function ProgressDialog({
    isOpen,
    onClose,
    Value,
    Max,
    Indeterminate
}: {
    isOpen: boolean
    onClose: () => void
    Value: number
    Max: number
    Indeterminate: boolean
}) {
    const [value, setValue] = useState(Value)
    const [maxValue, setMaxValue] = useState(Max)
    const [indeterminate, setIndeterminate] = useState(Indeterminate)

    const { theme, setTheme } = useTheme()
    return (
        <>
            <DialogContent>
                <div className='flex w-full content-center'>
                    <Progress
                        aria-label='Downloading...'
                        // size='md'
                        value={value}
                        // maxValue={maxValue}
                        color='success'
                        // showValueLabel={true}
                        className='max-w-md'
                        // isIndeterminate={indeterminate}
                        // label={`${value} of ${maxValue}`}
                    />
                </div>
            </DialogContent>
        </>
    )
}
