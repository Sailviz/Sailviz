'use client'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { useTheme } from 'next-themes'
import { ChangeEvent, useEffect, useState } from 'react'

export default function ProgressDialog({ isOpen, Value, Max }: { isOpen: boolean; Value: number; Max: number }) {
    const [value, setValue] = useState(0)

    useEffect(() => {
        setValue((Value / Max) * 100)
    }, [Value, Max])
    return (
        <Dialog open={isOpen} key={'progress-dialog'}>
            <DialogContent>
                <div className='flex flex-col w-full content-center'>
                    <Progress
                        aria-label='Loading...'
                        value={value}
                        className='max-w-md'
                        // label={`${value} of ${maxValue}`}
                    />
                    {Value} of {Max}
                </div>
            </DialogContent>
        </Dialog>
    )
}
