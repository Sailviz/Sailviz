import SeriesResultsTable from '@components/tables/FleetSeriesResultsTable'
import SeriesRaceTable from '@components/tables/SeriesRaceTable'
import FleetTable from '@components/tables/FleetTable'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@components/helpers/users'
import { ToCountSelect } from '@components/ToCountSelect'
import { Button } from '@components/ui/button'
import StartSequenceManager from '@components/StartSequenceManager'
import { PageSkeleton } from '@components/layout/PageSkeleton'
import { SeriesPursuitLength } from '@components/seriesPursuitLength'
import { useLoaderData, createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import { type Session } from '@sailviz/auth/client'
import { ActionButton } from '@components/ui/action-button'
import { Tagger } from '@components/tagger'
import { useEffect, useState } from 'react'
import { CATEGORY_OPTIONS } from '@features/series/series-table/use-series-table-filters'
import PageContainer from '@components/layout/page-container'
import { SeriesMaintainSequence } from '@components/seriesMaintainSequence'
import * as Types from '@sailviz/types'

function Page() {
    const session: Session = useLoaderData({ from: `__root__` })
    const { seriesId } = Route.useParams()

    const { data: org } = useQuery(orpcClient.organization.find.queryOptions({ input: { orgId: session.session.activeOrganizationId! } }))

    const FleetSettingsCreation = useMutation(orpcClient.fleet.settings.create.mutationOptions())
    const createRaceMutation = useMutation(orpcClient.race.create.mutationOptions())
    const createEventMutation = useMutation(orpcClient.trackable.event.create.mutationOptions())
    const updateEventMutation = useMutation(orpcClient.trackable.event.update.mutationOptions())
    const updateRaceMutation = useMutation(orpcClient.race.update.mutationOptions())
    const queryClient = useQueryClient()

    const stripeFetchQuery = useMutation(orpcClient.stripe.org.mutationOptions())
    const updateSeriesTagsMutation = useMutation(orpcClient.series.tags.update.mutationOptions())

    const [tagFilter, setTagFilter] = useState<string>('')

    const { data: series } = useQuery(orpcClient.series.find.queryOptions({ input: { seriesId: seriesId } }))

    const createFleetSettings = async () => {
        //only create fleet settings if the club has pro subscription
        const customer = await stripeFetchQuery.mutateAsync({ orgId: session!.session.activeOrganizationId! })
        if (customer.planName == 'SailViz Pro' && customer.subscriptionStatus == 'active') {
            await FleetSettingsCreation.mutateAsync({ seriesId: seriesId })
            queryClient.invalidateQueries({
                queryKey: orpcClient.fleet.settings.find.key({ type: 'query', input: { seriesId: seriesId } })
            })
        }
    }

    const updateTags = async (tags: string) => {
        setTagFilter(tags)
        await updateSeriesTagsMutation.mutateAsync({
            seriesId: seriesId!,
            orgId: org!.id,
            tags: tags ? tags.split('.') : []
        })
        queryClient.invalidateQueries({
            queryKey: orpcClient.series.find.key({ type: 'query', input: { seriesId: seriesId } })
        })
    }

    const createRace = async () => {
        const race = await createRaceMutation.mutateAsync({ seriesId })
        if (org?.orgData?.trackableEnabled && org.orgData.trackableOrgId) {
            // create event in trackable
            const event = await createEventMutation.mutateAsync({
                orgId: org.orgData.trackableOrgId,
                name: race.series?.name + ' - ' + race.number.toString()
            })
            await updateEventMutation.mutateAsync({
                id: event.id,
                name: event.name,
                eventType: 1, //force handicap for now.
                isSailviz: true,
                loop: true
            })
            console.log('created event', event)
            await updateRaceMutation.mutateAsync({
                ...race,
                trackableEventId: event.id
            })
        }
        await queryClient.invalidateQueries({
            queryKey: orpcClient.series.find.key({ type: 'query', input: { seriesId: seriesId } })
        })
    }

    useEffect(() => {
        if (!session || !series) return
        setTagFilter(series.tags.map(tag => tag.name).join('.'))
    }, [series, session])

    if (!session || series == undefined || org == undefined) {
        console.log('Series', series)
        // If the user is not authenticated, redirect to the login page
        return <PageSkeleton />
    }

    return (
        <PageContainer scrollable={false}>
            <div id='series' className='w-full'>
                <p className='text-6xl font-extrabold p-6'>{series?.name}</p>
                <div className='p-6'>
                    <Tagger filterKey='tag' title='Tag' options={CATEGORY_OPTIONS} setFilterValue={updateTags} filterValue={tagFilter} />
                    <SeriesRaceTable seriesId={seriesId} />
                </div>
                {userHasPermission(session.user, AVAILABLE_PERMISSIONS.editRaces) ? (
                    <ActionButton before={'Add Race'} during={'Adding'} after={'Done'} action={createRace} />
                ) : (
                    <> </>
                )}

                <p className='text-6xl font-extrabold p-6'>Fleets</p>
                <div className='p-6'>
                    <FleetTable seriesId={seriesId} />
                </div>
                {userHasPermission(session?.user, AVAILABLE_PERMISSIONS.editFleets) ? (
                    <>
                        <Button onClick={createFleetSettings} disabled={org.orgData!.planName != 'SailViz Pro'}>
                            Add Fleet
                        </Button>
                        <StartSequenceManager initialSequence={series.startSequence} seriesId={seriesId} />

                        <ToCountSelect seriesId={seriesId} />
                        <SeriesPursuitLength seriesId={seriesId} />
                        <SeriesMaintainSequence seriesId={seriesId} />
                    </>
                ) : (
                    <> </>
                )}
                <br />
                <div className='mb-6'>
                    {series.fleetSettings.map((fleetSettings: Types.FleetSettingsType, index: any) => {
                        return (
                            <div key={fleetSettings.id + index} className='mb-6'>
                                <div>{fleetSettings.name}</div>
                                <SeriesResultsTable seriesId={seriesId} fleetSettingsId={fleetSettings?.id} />
                            </div>
                        )
                    })}
                </div>
            </div>
        </PageContainer>
    )
}
export const Route = createFileRoute('/Dashboard/Series/$seriesId')({
    component: Page
})
