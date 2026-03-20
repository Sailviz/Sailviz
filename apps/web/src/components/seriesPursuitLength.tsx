import { Input } from './ui/input'
import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import type { SeriesType } from '@sailviz/types'
export function SeriesPursuitLength({ seriesId }: { seriesId: string }) {
    const series = useQuery(orpcClient.series.find.queryOptions({ input: { seriesId: seriesId } })).data as SeriesType

    const updateSeriesMutation = useMutation(orpcClient.series.update.mutationOptions())

    const [pursuitLength, setPursuitLength] = useState<number>(series?.settings?.pursuitLength || 0)

    const savePursuitLength = async () => {
        if (series === null) {
            return
        }
        let newSeriesData: SeriesType = window.structuredClone(series)
        newSeriesData.settings['pursuitLength'] = pursuitLength
        await updateSeriesMutation.mutateAsync(newSeriesData)
    }

    return (
        <div className='flex flex-col px-6 w-2/4 '>
            Pursuit Length (minutes):
            <Input
                onBlur={_ => {
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
