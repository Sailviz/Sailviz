'use client'
import { ChangeEvent, useEffect, useState } from 'react'
import { trpc } from '@/lib/trpc'
import { getSession, useSession } from 'next-auth/react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

export function ToCountSelect({ seriesId }: { seriesId: string }) {
    const [series, setSeries] = useState<SeriesDataType | null>(null)
    const { data: session, status } = useSession()
    useEffect(() => {
        const fetchSeries = async () => {
            setSeries(await trpc.series.query({ id: seriesId }))
        }
        fetchSeries()
    }, [seriesId])

    const saveSeriesToCount = async (value: number) => {
        if (series === null) {
            return
        }
        console.log('Saving series to count:', value)
        trpc.updateSeries.mutate({
            ...series,
            settings: {
                ...series.settings,
                numberToCount: value
            }
        })
    }

    if (series === null) {
        return <div>Loading...</div>
    }
    console.log(series)

    return (
        <div className='flex flex-col px-6 w-2/4 '>
            <Select
                onValueChange={value => {
                    console.log('Selected value:', value)
                    saveSeriesToCount(parseInt(value))
                }}
                defaultValue={series?.settings?.numberToCount?.toString() || '0'}
            >
                <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select a fleet' />
                </SelectTrigger>
                <SelectContent>
                    {series.races.map(race => (
                        <SelectItem key={race.id} value={race.number.toString()}>
                            {race.number}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
