import SeriesResultsTable from '@components/tables/FleetSeriesResultsTable'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import PageContainer from '@components/layout/page-container'
import { Heading } from '@components/ui/heading'
import { Separator } from '@components/ui/separator'
import SeriesRaceTableMinimal from '@components/tables/SeriesRaceTableMinimal'
import * as Types from '@sailviz/types'

const SeriesViewPage = ({ seriesId, orgName }: { seriesId: string; orgName: string }) => {
    const series = useQuery(orpcClient.series.find.queryOptions({ input: { seriesId: seriesId! } })).data

    // list of current series
    //list of

    return (
        <PageContainer scrollable={false}>
            <div className='flex flex-1 flex-col space-y-4'>
                <div className='flex items-start justify-between'>
                    <Heading title={orgName} description={series?.name || ''} />
                </div>
                <Separator />
                <Heading title={'Races'} description={''} />

                <SeriesRaceTableMinimal seriesId={seriesId} />
                <Separator />

                <Heading title={'Series Results'} description={''} />

                {series?.fleetSettings.map((fleetSettings: Types.FleetSettingsType) => {
                    return (
                        <>
                            <div>{fleetSettings.name}</div>
                            <SeriesResultsTable seriesId={series.id} fleetSettingsId={fleetSettings?.id} />
                        </>
                    )
                })}
            </div>
        </PageContainer>
    )
}

export default SeriesViewPage
