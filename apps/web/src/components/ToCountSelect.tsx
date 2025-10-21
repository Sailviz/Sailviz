import { useMutation, useQuery } from '@tanstack/react-query'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { orpcClient } from '@lib/orpc'
import type { RaceType, SeriesType } from '@sailviz/types'
export function ToCountSelect({ seriesId }: { seriesId: string }) {
    const series = useQuery(orpcClient.series.find.queryOptions({ input: { seriesId } })).data as SeriesType

    const updateSeriesMutation = useMutation(orpcClient.series.update.mutationOptions())

    const saveSeriesToCount = async (value: number) => {
        if (series === null) {
            return
        }
        console.log('Saving series to count:', value)
        let newSeriesData: SeriesType = window.structuredClone(series)
        console.log(newSeriesData)
        newSeriesData.settings['numberToCount'] = value
        await updateSeriesMutation.mutateAsync(newSeriesData)
        // mutateSeries()
    }

    if (!series) {
        return <></>
    }

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
                    {series.races.map((race: RaceType) => (
                        <SelectItem key={race.id} value={race.number.toString()}>
                            {race.number}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
