'use client'
import SeriesResultsTable from '@/components/tables/FleetSeriesResultsTable'
import SeriesRaceTable from '@/components/tables/SeriesRaceTable'
import FleetTable from '@/components/tables/FleetTable'
import * as Fetcher from '@/components/Fetchers'
import EditFleetModal from '@/components/layout/dashboard/EditFleetSettingsModal'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@/components/helpers/users'
import { ToCountSelect } from '@/components/ToCountSelect'
import { AddRaceButton } from '@/components/AddRaceButton'
import { use, useState } from 'react'
import { useSession } from 'next-auth/react'
import * as DB from '@/components/apiMethods'
import { Button } from '@/components/ui/button'
import StartSequenceManager from '@/components/StartSequenceManager'
type PageProps = { params: Promise<{ seriesId: string }> }

export default function Page(props: PageProps) {
    const { seriesId } = use(props.params)
    const { data: session, status } = useSession()

    const [editFleet, setEditFleet] = useState(false)

    const { startSequence, startSequenceIsError, startSequenceIsValidating, mutateStartSequence } = Fetcher.GetStartSequence(seriesId)
    const { series, seriesIsError, seriesIsValidating, mutateSeries } = Fetcher.Series(seriesId)

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
        await DB.createFleetSettings(seriesId)
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

    // const showFleetSettingsModal = async (fleetSettings: FleetSettingsType) => {
    //     setActiveFleetSettings(fleetSettings)
    //     editFleetSettingsModal.onOpen()
    // }

    return (
        <>
            {/* <EditFleetModal isOpen={editFleetSettingsModal.isOpen} fleetSettings={activeFleetSettings} onSubmit={editFleetSettings} onClose={editFleetSettingsModal.onClose} /> */}
            <div id='series' className='w-full'>
                <p className='text-6xl font-extrabold p-6'>series name</p>
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
                        <Button onClick={createFleetSettings}>Add Fleet</Button>

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
