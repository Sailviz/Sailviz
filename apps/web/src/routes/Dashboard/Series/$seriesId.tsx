import SeriesResultsTable from '@components/tables/FleetSeriesResultsTable'
import SeriesRaceTable from '@components/tables/SeriesRaceTable'
import FleetTable from '@components/tables/FleetTable'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@components/helpers/users'
import { ToCountSelect } from '@components/ToCountSelect'
import { AddRaceButton } from '@components/AddRaceButton'
import { Button } from '@components/ui/button'
import StartSequenceManager from '@components/StartSequenceManager'
import { PageSkeleton } from '@components/layout/PageSkeleton'
import { SeriesPursuitLength } from '@components/seriesPursuitLength'
import { useLoaderData, createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'

function Page() {
    const session = useLoaderData({ from: `__root__` })
    const { seriesId } = Route.useParams()

    const FleetSettingsCreation = useMutation(orpcClient.fleet.settings.create.mutationOptions())
    const queryClient = useQueryClient()

    const { data: series } = useQuery(orpcClient.series.find.queryOptions({ input: { seriesId: seriesId } }))
    const { data: startSequence } = useQuery(orpcClient.startSequence.find.queryOptions({ input: { seriesId: seriesId } }))

    const createFleetSettings = async () => {
        //only create fleet settings if the club has pro subscription
        if (session?.club?.stripe.planName == 'SailViz Pro') {
            await FleetSettingsCreation.mutateAsync({ seriesId: seriesId })
            queryClient.invalidateQueries({
                queryKey: orpcClient.series.find.key({ type: 'query', input: { seriesId: seriesId } })
            })
        }
    }

    if (!session || series == undefined || startSequence == undefined) {
        console.log('Series', series)
        // If the user is not authenticated, redirect to the login page
        return <PageSkeleton />
    }
    console.log('Series:', series)
    return (
        <>
            {/* <EditFleetModal isOpen={editFleetSettingsModal.isOpen} fleetSettings={activeFleetSettings} onSubmit={editFleetSettings} onClose={editFleetSettingsModal.onClose} /> */}
            <div id='series' className='w-full'>
                <p className='text-6xl font-extrabold p-6'>{series?.name}</p>
                <div className='p-6'>
                    <SeriesRaceTable seriesId={seriesId} />
                </div>
                {userHasPermission(session?.user, AVAILABLE_PERMISSIONS.editRaces) ? <AddRaceButton seriesId={seriesId} /> : <> </>}

                <p className='text-6xl font-extrabold p-6'>Fleets</p>
                <div className='p-6'>
                    <FleetTable seriesId={seriesId} />
                </div>
                {userHasPermission(session?.user, AVAILABLE_PERMISSIONS.editFleets) ? (
                    <>
                        <Button onClick={createFleetSettings} disabled={session?.club?.stripe.planName != 'SailViz Pro'}>
                            Add Fleet
                        </Button>
                        <StartSequenceManager initialSequence={startSequence} seriesId={seriesId} key={startSequence?.length} />

                        <ToCountSelect seriesId={seriesId} />
                        <SeriesPursuitLength seriesId={seriesId} />
                    </>
                ) : (
                    <> </>
                )}
                <div className='mb-6'>
                    {series.fleetSettings.map((fleetSettings: FleetSettingsType, index: any) => {
                        return (
                            <div key={fleetSettings.id + index} className='mb-6'>
                                <div>{fleetSettings.name}</div>
                                <SeriesResultsTable seriesId={seriesId} fleetSettingsId={fleetSettings?.id} />
                            </div>
                        )
                    })}
                </div>
            </div>
        </>
    )
}
export const Route = createFileRoute('/dashboard/Series/$seriesId')({
    component: Page
})
