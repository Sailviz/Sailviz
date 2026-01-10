import { createFileRoute } from '@tanstack/react-router'
import SeriesResultsTable from '@components/tables/FleetSeriesResultsTable'
import { PageSkeleton } from '@components/layout/PageSkeleton'
import { title } from '@components/layout/home/primitaves'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import type { FleetSettingsType, SeriesType } from '@sailviz/types'
import SignOnLayout from '@components/layout/SignOn/layout'

function Page() {
    const { seriesId } = Route.useParams()

    const series = useQuery(orpcClient.series.find.queryOptions({ input: { seriesId } })).data as SeriesType

    if (series == undefined) {
        return <PageSkeleton />
    }
    return (
        <SignOnLayout>
            <div className='h-1/6 p-6'>
                <h1 className={title({ color: 'blue' })}>Series Results - {series.name} </h1>
                <p className='py-4 text-2xl font-bold'>
                    {' '}
                    Series of {series.races.length} races - {series.settings.numberToCount} to count
                </p>
            </div>
            <div className='h-5/6 p-6'>
                {series.fleetSettings.map((fleetSettings: FleetSettingsType) => {
                    return (
                        <>
                            <div>{fleetSettings.name}</div>
                            <SeriesResultsTable seriesId={series.id} fleetSettingsId={fleetSettings?.id} />
                        </>
                    )
                })}
            </div>
        </SignOnLayout>
    )
}

export const Route = createFileRoute('/SignOn/Series/$seriesId')({
    component: Page
})
