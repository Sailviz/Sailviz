"use client"
import { ChangeEvent, MouseEventHandler, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import * as DB from 'components/apiMethods';
import Select from 'react-select';
import SeriesResultsTable from "components/tables/SeriesResultsTable";
import SeriesRaceTable from "components/tables/SeriesRaceTable";
import FleetTable from "components/tables/FleetTable";
import * as Fetcher from 'components/Fetchers';
import { PageSkeleton } from "components/ui/PageSkeleton";
import { Slider } from "@nextui-org/react";
import { mutate } from "swr";

export default function Page({ params }: { params: { slug: string } }) {
    const Router = useRouter();
    const { user, userIsError, userIsValidating } = Fetcher.UseUser()
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { series, seriesIsError, seriesIsValidating } = Fetcher.Series(params.slug)
    const { boats, boatsIsError, boatsIsValidating } = Fetcher.Boats()

    const seriesId = params.slug

    var [activeRaceId, setActiveRaceId] = useState("")
    var [activeFleetId, setActiveFleetId] = useState("")

    const [fleetModal, setFleetModal] = useState(false)

    const [options, setOptions] = useState([{ label: "", value: {} as BoatDataType }])
    const [selectedOption, setSelectedOption] = useState<object[]>([])


    const createRace = async () => {
        mutate('/api/GetSeriesById?id=' + series.id)
        var race = await DB.createRace(club.id, series.id)
        console.log(race)
        mutate('/api/GetSeriesById?id=' + series.id)
    }

    const removeRace = async (raceId: string) => {
        mutate('/api/GetSeriesById?id=' + series.id)
        let result = await DB.deleteRaceById(raceId)
        if (!result) { return } // failed to delete race
        // //mutate series
        mutate('/api/GetSeriesById?id=' + series.id)
    }

    const goToRace = async (raceId: string) => {
        Router.push('/Race/' + raceId)
    }

    const saveSeriesToCount = async (value: number | number[]) => {
        let newSeriesData: SeriesDataType = window.structuredClone(series)
        console.log(newSeriesData)
        newSeriesData.settings['numberToCount'] = value
        //mutate series


        await DB.updateSeries(newSeriesData)
    }

    const createFleet = async () => {
        await DB.createFleetSettings(series.id)
        //mutate series
    }

    const deleteFleet = async (fleetId: string) => {
        await DB.DeleteFleetSettingsById(fleetId)

        //mutate series
    }

    const editFleet = async () => {
        var fleet = series.fleetSettings.find(x => x.id == activeFleetId)
        if (fleet == undefined) {
            console.warn("fleet not found: " + activeFleetId)
            return
        }
        const Name = document.getElementById('editFleetName') as HTMLInputElement;
        fleet.name = Name.value

        const StartDelay = document.getElementById('editFleetStartDelay') as HTMLInputElement;
        fleet.startDelay = parseInt(StartDelay.value)

        fleet.boats = selectedOption.map(x => (x as any).value)

        await DB.updateFleetSettingsById(fleet)

        //mutate series

        //hide fleet edit modal
        setFleetModal(false)
    }

    const showFleetModal = async (fleetId: string) => {
        setActiveFleetId(fleetId)
        setFleetModal(true)
        var fleet = series.fleetSettings.find(x => x.id == fleetId)
        if (fleet == undefined) {
            console.warn("fleet not found: " + activeFleetId)
            return
        }
        const Name = document.getElementById('editFleetName') as HTMLInputElement;
        Name.value = fleet.name

        const StartDelay = document.getElementById('editFleetStartDelay') as HTMLInputElement;
        StartDelay.value = fleet.startDelay.toString()

        try {
            setSelectedOption(fleet.boats.map(x => ({ value: x, label: x.name })))
        } catch (error) {
            //result does not have boat assigned
        }

    }

    console.log(series)
    if (userIsValidating || clubIsValidating || boatsIsValidating || seriesIsError || series == undefined || club == undefined || user == undefined || boats == undefined) {
        return (
            <PageSkeleton />
        )
    }
    return (
        <div className=''>
            <div id="fleetEditModal" className={"fixed z-10 left-0 top-0 w-full h-full overflow-auto bg-gray-400 backdrop-blur-sm bg-opacity-20" + (fleetModal ? "" : " hidden")} key={activeRaceId}>
                <div className="mx-40 my-20 px-10 py-5 border w-4/5 bg-gray-300 rounded-sm">
                    <div className="text-6xl font-extrabold p-6 float-right cursor-pointer" onClick={() => setFleetModal(false)}>&times;</div>
                    <div className="text-6xl font-extrabold p-6">Edit Fleet</div>
                    <div className="flex w-3/4">
                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold'>
                                Name
                            </p>
                            <input type="text" id="editFleetName" className="h-full text-2xl p-4" />
                        </div>
                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold'>
                                Start Delay
                            </p>
                            <input type="text" id="editFleetStartDelay" className="h-full text-2xl p-4" />
                        </div>
                    </div>
                    <div>
                        <p className="text-6xl font-extrabold p-6">
                            Boats
                        </p>
                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold'>
                                Class
                            </p>
                            <div className="w-full p-2 mx-0 my-2">
                                <Select
                                    id="editClass"
                                    className=' w-full h-full text-3xl'
                                    options={options}
                                    isMulti={true}
                                    isClearable={false}
                                    value={selectedOption}
                                    onChange={(choice) => setSelectedOption(choice! as [])}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row justify-end">
                        <div className=" flex justify-end mt-8">
                            <div className="p-4 mr-2">
                                <p id="confirmRemove" onClick={() => { deleteFleet(activeFleetId); setFleetModal(false) }} className="cursor-pointer text-white bg-red-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-xl text-lg px-12 py-4 text-center mr-3 md:mr-0">
                                    Remove
                                </p>
                            </div>
                        </div>
                        <div className=" flex justify-end mt-8">
                            <div className="p-4 mr-2">
                                <p id="confirmEdit" onClick={editFleet} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xl px-12 py-4 text-center mr-3 md:mr-0">
                                    update
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="series" className="w-full">
                <p className="text-6xl font-extrabold p-6">
                    {series.name}
                </p>
                <div className='p-6'>
                    <SeriesRaceTable id={seriesId} removeRace={removeRace} goToRace={goToRace} />
                </div>
                <div className="p-6">
                    <p id='seriesAddRace' onClick={createRace} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0">
                        Add Race
                    </p>
                </div>
                <p className="text-6xl font-extrabold p-6">
                    Fleets
                </p>
                <div className='p-6'>
                    <FleetTable data={series.fleetSettings} key={JSON.stringify(series.fleetSettings)} showFleetModal={(fleetId: string) => showFleetModal(fleetId)} />

                </div>
                <div className="p-6">
                    <p id='seriesAddRace' onClick={createFleet} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0">
                        Add Fleet
                    </p>
                </div>
                <div className='flex flex-col px-6 w-2/4 '>
                    <Slider
                        label="Races To Count"
                        minValue={1}
                        maxValue={series.races.length}
                        defaultValue={series.settings.numberToCount}
                        onChangeEnd={(value) => saveSeriesToCount(value)}
                        showTooltip={true}
                        getValue={(races) => `${races} of ${series.races.length} races`}
                    />
                </div>
                <div className="mb-6">
                    <SeriesResultsTable key={JSON.stringify(series)} data={series} />
                </div>
            </div>
        </div>
    )
}