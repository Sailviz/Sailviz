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
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { PageSkeleton } from '@/components/layout/PageSkeleton'
import prisma from '@/lib/prisma'

type PageProps = { params: Promise<{ seriesId: string }> }

export default async function Page(props: PageProps) {
    const { seriesId } = await props.params
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })
    console.log('Session:', session)
    if (!session || !session.club) {
        // If the user is not authenticated, redirect to the login page
        return <PageSkeleton />
    }

    const startSequence = (await prisma.startSequence.findMany({
        where: { seriesId: seriesId },
        orderBy: { order: 'asc' }
    })) as unknown as StartSequenceStep[]

    const series = await prisma.series.findUnique({
        where: { id: seriesId },
        include: {
            fleetSettings: true,
            club: true
        }
    })

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

    // const createFleetSettings = async () => {
    //     await DB.createFleetSettings(seriesId)
    // }

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

    // const showFleetSettingsModal = async (fleetSettings: FleetSettingsType) => {
    //     setActiveFleetSettings(fleetSettings)
    //     editFleetSettingsModal.onOpen()
    // }

    return (
        <>
            {/* <EditFleetModal isOpen={editFleetSettingsModal.isOpen} fleetSettings={activeFleetSettings} onSubmit={editFleetSettings} onClose={editFleetSettingsModal.onClose} /> */}
            <div id='series' className='w-full'>
                <p className='text-6xl font-extrabold p-6'>{series?.name}</p>
                <div className='p-6'>
                    <SeriesRaceTable id={seriesId} />
                </div>
                {userHasPermission(session!.user, AVAILABLE_PERMISSIONS.editRaces) ? <AddRaceButton seriesId={seriesId} /> : <> </>}

                <p className='text-6xl font-extrabold p-6'>Fleets</p>
                <div className='p-6'>
                    <FleetTable seriesId={seriesId} />
                </div>
                {userHasPermission(session!.user, AVAILABLE_PERMISSIONS.editFleets) ? (
                    <>
                        <StartSequenceManager initialSequence={startSequence} seriesId={seriesId} key={startSequence?.length} />
                        {/* <Button onClick={createFleetSettings}>Add Fleet</Button> */}

                        <ToCountSelect seriesId={seriesId} />
                    </>
                ) : (
                    <> </>
                )}
                <div className='mb-6'>
                    {series?.fleetSettings.map((fleetSettings, index) => {
                        return (
                            <>
                                <div>{fleetSettings.name}</div>
                                <SeriesResultsTable seriesId={seriesId} fleetSettingsId={fleetSettings?.id} />
                            </>
                        )
                    })}
                </div>
            </div>
        </>
    )
}
