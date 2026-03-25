import { createFileRoute } from '@tanstack/react-router'
import SeriesResultsTable from '@components/tables/FleetSeriesResultsTable'
import { title } from '@components/layout/home/primitaves'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import HomeNav from '@components/layout/home/navbar'

function Page() {
    const { seriesId } = Route.useParams()

    const series = useQuery(orpcClient.series.find.queryOptions({ input: { seriesId: seriesId! } })).data

    // list of current series
    //list of

    return (
        <>
            <HomeNav />
            <div className='py-4'>
                <div className={title({ color: 'blue' })}>{series?.name}</div>
            </div>
            {series?.fleetSettings.map((fleetSettings: FleetSettingsType) => {
                return (
                    <>
                        <div>{fleetSettings.name}</div>
                        <SeriesResultsTable seriesId={series.id} fleetSettingsId={fleetSettings?.id} />
                    </>
                )
            })}
        </>
    )
}

export const Route = createFileRoute('/club/$orgName/Series/$seriesId')({
    component: Page
})
