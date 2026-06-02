import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import type { SeriesType } from '@sailviz/types'
import { Switch } from './ui/switch'
export function SeriesMaintainSequence({ seriesId }: { seriesId: string }) {
    const series = useQuery(orpcClient.series.find.queryOptions({ input: { seriesId: seriesId } })).data as SeriesType

    const updateSeriesMutation = useMutation(orpcClient.series.update.mutationOptions())

    const [maintainSequence, setMaintainSequence] = useState<boolean>(series?.settings?.maintainSequence || false)

    const saveMaintainSequence = async (recall: boolean) => {
        if (series === null) {
            return
        }
        let newSeriesData: SeriesType = window.structuredClone(series)
        newSeriesData.settings['maintainSequence'] = recall
        setMaintainSequence(recall)
        await updateSeriesMutation.mutateAsync(newSeriesData)
    }

    return (
        <div className='flex flex-col px-6 w-2/4 '>
            Maintain Start Sequence during General Recall:
            <Switch onCheckedChange={checked => saveMaintainSequence(checked)} checked={maintainSequence} />
        </div>
    )
}
