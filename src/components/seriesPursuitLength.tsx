'use client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import * as Fetcher from '@/components/Fetchers'
import * as DB from '@/components/apiMethods'
import { Input } from './ui/input'
import { useState } from 'react'
export function SeriesPursuitLength({ seriesId }: { seriesId: string }) {
    const { series, seriesIsError, seriesIsValidating, mutateSeries } = Fetcher.Series(seriesId)

    const [pursuitLength, setPursuitLength] = useState<number>(series?.settings?.pursuitLength || 0)

    const savePursuitLength = async () => {
        if (series === null) {
            return
        }
        let newSeriesData: SeriesDataType = window.structuredClone(series)
        newSeriesData.settings['pursuitLength'] = pursuitLength
        await DB.updateSeries(newSeriesData)
    }

    if (seriesIsValidating) {
        return <div>Loading...</div>
    }
    console.log(series)

    return (
        <div className='flex flex-col px-6 w-2/4 '>
            Pursuit Length (minutes):
            <Input
                onBlur={e => {
                    savePursuitLength()
                }}
                onChange={e => {
                    setPursuitLength(parseInt(e.target.value))
                }}
                value={pursuitLength}
            />
        </div>
    )
}
