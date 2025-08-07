'use client'
import SeriesResultsTable from '@/components/tables/FleetSeriesResultsTable'
import SeriesRaceTable from '@/components/tables/SeriesRaceTable'
import FleetTable from '@/components/tables/FleetTable'
import * as Fetcher from '@/components/Fetchers'
import EditFleetModal from '@/components/layout/dashboard/EditFleetSettingsModal'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@/components/helpers/users'
import { ToCountSelect } from '@/components/ToCountSelect'
import { AddRaceButton } from '@/components/AddRaceButton'
import { use } from 'react'

import * as DB from '@/components/apiMethods'
import { Button } from '@/components/ui/button'
import StartSequenceManager from '@/components/StartSequenceManager'
import { PageSkeleton } from '@/components/layout/PageSkeleton'
import prisma from '@/lib/prisma'
import { useSession } from '@/lib/auth-client'
import { SeriesPursuitLength } from '@/components/seriesPursuitLength'

type PageProps = { params: Promise<{ seriesId: string }> }

export default function Page(props: PageProps) {
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()
    const { seriesId } = use(props.params)
    console.log('Session:', session)

    const { series, seriesIsError, seriesIsValidating } = Fetcher.Series(seriesId)
    const { startSequence, startSequenceIsError, startSequenceIsValidating } = Fetcher.GetStartSequence(seriesId)

    // const startSequence = prisma.startSequence.findMany({
    //     where: { seriesId: seriesId },
    //     orderBy: { order: 'asc' }
    // }) as unknown as StartSequenceStep[]

    // const series = prisma.series.findUnique({
    //     where: { id: seriesId },
    //     include: {
    //         fleetSettings: true,
    //         club: true
    //     }
    // })

    // const createRace = async () => {
    //     var race = await DB.createRace(club.id, series.id)
    //     console.log(race)
    //     mutateSeries()
    // }

    // const removeRace = async (raceId: string) => {
    //     let result = await DB.deleteRaceById(raceId)
    //     if (!result) {
    //         return
    //     } // failed to delete race
    //     mutateSeries()
    // }

    const createFleetSettings = async () => {
        //only create fleet settings if the club has pro subscription
        if (session?.club?.stripe.planName == 'Sailviz Pro') {
            await DB.createFleetSettings(seriesId)
        }
    }

    // const deleteFleetSettings = async (fleetId: string) => {
    //     await DB.DeleteFleetSettingsById(fleetId)

    //     mutateSeries()
    // }

    // const editFleetSettings = async (fleetSettings: FleetSettingsType) => {
    //     mutate(`/api/GetFleetSettingsBySeriesId?id=${seriesId}`)
    //     editFleetSettingsModal.onClose()
    //     await DB.updateFleetSettingsById(fleetSettings)
    //     mutate(`/api/GetFleetSettingsBySeriesId?id=${seriesId}`)

    //     mutateSeries()
    // }
    const updateFleet = async (fleet: FleetSettingsType): Promise<void> => {
        await DB.updateFleetSettingsById(fleet)
    }

    // const showFleetSettingsModal = async (fleetSettings: FleetSettingsType) => {
    //     setActiveFleetSettings(fleetSettings)
    //     editFleetSettingsModal.onOpen()
    // }

    if (!session || !session.club || series == undefined) {
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
                    {series.fleetSettings.map((fleetSettings, index) => {
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
