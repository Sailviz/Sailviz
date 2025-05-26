'use client'
import SeriesResultsTable from '@/components/tables/SeriesResultsTable'
import SeriesRaceTable from '@/components/tables/SeriesRaceTable'
import FleetTable from '@/components/tables/FleetTable'
import * as Fetcher from '@/components/Fetchers'
import EditFleetModal from '@/components/layout/dashboard/EditFleetSettingsModal'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@/components/helpers/users'
import { ToCountSelect } from '@/components/ToCountSelect'
import { AddRaceButton } from '@/components/AddRaceButton'
import { use } from 'react'
import { useSession } from 'next-auth/react'

type PageProps = { params: Promise<{ seriesId: string }> }

export default function Page(props: PageProps) {
    const { seriesId } = use(props.params)
    const { data: session, status } = useSession()

    // const series = await api.series({ id: params.slug })
    // const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    // const { series, seriesIsError, seriesIsValidating, mutateSeries } = Fetcher.Series(params.slug)
    // const { boats, boatsIsError, boatsIsValidating } = Fetcher.Boats()

    // var [activeRaceId, setActiveRaceId] = useState('')
    // var [activeFleetSettings, setActiveFleetSettings] = useState<FleetSettingsType>()

    // const editFleetSettingsModal = useDisclosure()

    // const [options, setOptions] = useState([{ label: '', value: {} as BoatDataType }])
    // const [selectedOption, setSelectedOption] = useState<object[]>([])

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

    // const goToRace = async (raceId: string) => {
    //     Router.push('/Race/' + raceId)
    // }

    // const saveSeriesToCount = async (value: number | number[]) => {
    //     let newSeriesData: SeriesDataType = window.structuredClone(series)
    //     console.log(newSeriesData)
    //     newSeriesData.settings['numberToCount'] = value
    //     mutateSeries()

    //     await DB.updateSeries(newSeriesData)
    // }

    // const createFleetSettings = async () => {
    //     await DB.createFleetSettings(series.id)
    //     mutateSeries()
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
                        <div className='p-6'>
                            <p className='cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0'>
                                Add Fleet
                            </p>
                        </div>

                        <ToCountSelect seriesId={seriesId} />
                    </>
                ) : (
                    <> </>
                )}
                <div className='mb-6'>
                    <SeriesResultsTable seriesId={seriesId} />
                </div>
            </div>
        </>
    )
}
