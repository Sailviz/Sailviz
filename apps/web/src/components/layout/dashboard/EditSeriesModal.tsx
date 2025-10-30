import { useEffect, useState } from 'react'
import { DialogContent, DialogFooter, DialogHeader } from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import type { SeriesType } from '@sailviz/types'

export default function EditSeriesDialog({ seriesId, onSubmit, onClose }: { seriesId: string; onSubmit: (series: SeriesType) => void; onClose: () => void }) {
    const series = useQuery(orpcClient.series.find.queryOptions({ input: { seriesId: seriesId } })).data as SeriesType
    const [seriesName, setSeriesName] = useState('')

    useEffect(() => {
        if (series == undefined) return
        setSeriesName(series.name)
    }, [series])

    if (series === undefined) return <></>

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
