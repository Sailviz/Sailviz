'use client'
import { ChangeEvent, useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import * as Fetcher from '@/components/Fetchers'
import * as DB from '@/components/apiMethods'
export function ToCountSelect({ seriesId }: { seriesId: string }) {
    const { series, seriesIsError, seriesIsValidating, mutateSeries } = Fetcher.Series(seriesId)

    const saveSeriesToCount = async (value: number) => {
        if (series === null) {
            return
        }
        console.log('Saving series to count:', value)
        let newSeriesData: SeriesDataType = window.structuredClone(series)
        console.log(newSeriesData)
        newSeriesData.settings['numberToCount'] = value
        await DB.updateSeries(newSeriesData)
        mutateSeries()
    }

    if (seriesIsValidating) {
        return <div>Loading...</div>
    }
    console.log(series)

    return (
        <div className='flex flex-col px-6 w-2/4 '>
            Races to Count:
            <Select
                onValueChange={value => {
                    console.log('Selected value:', value)
                    saveSeriesToCount(parseInt(value))
                }}
                value={series?.settings?.numberToCount?.toString() || '0'}
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
