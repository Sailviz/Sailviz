'use client'
import { useTheme } from 'next-themes'
import { ChangeEvent, useState } from 'react'
import * as Fetcher from '@/components/Fetchers'
import { DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function EditSeriesDialog({
    isOpen,
    seriesId,
    onSubmit,
    onClose
}: {
    isOpen: boolean
    seriesId: string
    onSubmit: (series: SeriesDataType) => void
    onClose: () => void
}) {
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { series, seriesIsError, seriesIsValidating } = Fetcher.GetSeriesById(seriesId)
    const [seriesName, setSeriesName] = useState(series.name)

    const { theme, setTheme } = useTheme()
    return (
        <>
            <DialogContent>
                <DialogHeader className='flex flex-col gap-1'>Edit Series</DialogHeader>
                <div className='flex w-full'>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Name</p>

                        <Input id='name' type='text' defaultValue={series.name} onChange={e => setSeriesName(e.target.value)} placeholder='Name' autoComplete='off' />
                    </div>
                </div>
                <DialogFooter>
                    <Button color='danger' onClick={onClose}>
                        Close
                    </Button>
                    <Button color='primary' onClick={() => onSubmit({ ...series, name: seriesName })}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </>
    )
}
