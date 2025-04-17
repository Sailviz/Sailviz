'use client'
import { ChangeEvent, MouseEventHandler, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import Select from 'react-select'
import SeriesResultsTable from '@/components/tables/SeriesResultsTable'
import SeriesRaceTable from '@/components/tables/SeriesRaceTable'
import FleetTable from '@/components/tables/FleetTable'
import * as Fetcher from '@/components/Fetchers'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { Slider, useDisclosure } from '@nextui-org/react'
import { mutate } from 'swr'
import EditFleetModal from '@/components/ui/dashboard/EditFleetSettingsModal'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@/components/helpers/users'
import { use } from 'chai'

export default function Page({ params }: { params: { slug: string } }) {
    const Router = useRouter()
    const { user, userIsError, userIsValidating } = Fetcher.UseUser()
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { series, seriesIsError, seriesIsValidating, mutateSeries } = Fetcher.Series(params.slug)
    const { boats, boatsIsError, boatsIsValidating } = Fetcher.Boats()

    const seriesId = params.slug

    var [activeRaceId, setActiveRaceId] = useState('')
    var [activeFleetSettings, setActiveFleetSettings] = useState<FleetSettingsType>()

    const editFleetSettingsModal = useDisclosure()

    const [options, setOptions] = useState([{ label: '', value: {} as BoatDataType }])
    const [selectedOption, setSelectedOption] = useState<object[]>([])

    const createRace = async () => {
        var race = await DB.createRace(club.id, series.id)
        console.log(race)
        mutateSeries()
    }

    const removeRace = async (raceId: string) => {
        let result = await DB.deleteRaceById(raceId)
        if (!result) {
            return
        } // failed to delete race
        mutateSeries()
    }

    const goToRace = async (raceId: string) => {
        Router.push('/Race/' + raceId)
    }

    const saveSeriesToCount = async (value: number | number[]) => {
        let newSeriesData: SeriesDataType = window.structuredClone(series)
        console.log(newSeriesData)
        newSeriesData.settings['numberToCount'] = value
        mutateSeries()

        await DB.updateSeries(newSeriesData)
    }

    const createFleetSettings = async () => {
        await DB.createFleetSettings(series.id)
        mutateSeries()
    }

    const deleteFleetSettings = async (fleetId: string) => {
        await DB.DeleteFleetSettingsById(fleetId)

        mutateSeries()
    }

    const editFleetSettings = async (fleetSettings: FleetSettingsType) => {
        mutate(`/api/GetFleetSettingsBySeriesId?id=${seriesId}`)
        editFleetSettingsModal.onClose()
        await DB.updateFleetSettingsById(fleetSettings)
        mutate(`/api/GetFleetSettingsBySeriesId?id=${seriesId}`)

        mutateSeries()
    }

    const showFleetSettingsModal = async (fleetSettings: FleetSettingsType) => {
        setActiveFleetSettings(fleetSettings)
        editFleetSettingsModal.onOpen()
    }

    console.log(series)
    if (userIsValidating || clubIsValidating || boatsIsValidating || seriesIsError || series == undefined || club == undefined || user == undefined || boats == undefined) {
        return <PageSkeleton />
    }
    return (
        <>
            <EditFleetModal isOpen={editFleetSettingsModal.isOpen} fleetSettings={activeFleetSettings} onSubmit={editFleetSettings} onClose={editFleetSettingsModal.onClose} />
            <div id='series' className='w-full'>
                <p className='text-6xl font-extrabold p-6'>{series.name}</p>
                <div className='p-6'>
                    <SeriesRaceTable id={seriesId} removeRace={removeRace} goToRace={goToRace} />
                </div>
                {userHasPermission(user, AVAILABLE_PERMISSIONS.editRaces) ? (
                    <div className='p-6'>
                        <p
                            id='seriesAddRace'
                            onClick={createRace}
                            className='cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0'
                        >
                            Add Race
                        </p>
                    </div>
                ) : (
                    <> </>
                )}
                <p className='text-6xl font-extrabold p-6'>Fleets</p>
                <div className='p-6'>
                    <FleetTable seriesId={params.slug} edit={showFleetSettingsModal} remove={deleteFleetSettings} />
                </div>
                {userHasPermission(user, AVAILABLE_PERMISSIONS.editFleets) ? (
                    <>
                        <div className='p-6'>
                            <p
                                id='seriesAddRace'
                                onClick={createFleetSettings}
                                className='cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0'
                            >
                                Add Fleet
                            </p>
                        </div>

                        <div className='flex flex-col px-6 w-2/4 '>
                            <Slider
                                label='Races To Count'
                                minValue={1}
                                maxValue={series.races.length}
                                defaultValue={series.settings.numberToCount}
                                onChangeEnd={value => {
                                    saveSeriesToCount(value)
                                    mutateSeries()
                                }}
                                showTooltip={true}
                                getValue={races => `${races} of ${series.races.length} races`}
                            />
                        </div>
                    </>
                ) : (
                    <> </>
                )}
                <div className='mb-6'>
                    <SeriesResultsTable key={JSON.stringify(series)} data={series} />
                </div>
            </div>
        </>
    )
}
