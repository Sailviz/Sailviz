"use client"
import { ChangeEvent, MouseEventHandler, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import * as DB from 'components/apiMethods';
import Select from 'react-select';
import SeriesResultsTable from "components/tables/SeriesResultsTable";
import Dashboard from "components/ui/Dashboard";
import SeriesTable from "components/tables/SeriesTable";
import FleetTable from "components/tables/FleetTable";
import * as Fetcher from 'components/Fetchers';
import { PageSkeleton } from "components/ui/PageSkeleton";

export default function Page({ params }: { params: { slug: string } }) {
    const Router = useRouter();
    const { user, userIsError, userIsValidating } = Fetcher.UseUser()
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { series, seriesIsError, seriesIsValidating } = Fetcher.Series(params.slug)
    const { boats, boatsIsError, boatsIsValidating } = Fetcher.Boats(club)

    var [activeRaceId, setActiveRaceId] = useState("")
    var [activeFleetId, setActiveFleetId] = useState("")

    const [fleetModal, setFleetModal] = useState(false)

    const [options, setOptions] = useState([{ label: "", value: {} as BoatDataType }])
    const [selectedOption, setSelectedOption] = useState<object[]>([])


    const createRace = async () => {
        var race = await DB.createRace(club.id, series.id)
        console.log(race)
        //mutate series
    }

    const removeRace = async (raceId: string) => {
        if (confirm("Are you sure you want to delete the race?") == false) return
        let result = await DB.deleteRace(raceId)
        if (!result) { return } // failed to delete race
        let newSeriesData: SeriesDataType = window.structuredClone(series)
        let raceIndex = newSeriesData.races.findIndex(x => x.id === raceId)
        console.log(raceIndex)
        newSeriesData.races.splice(raceIndex, 1)
        console.log(newSeriesData)
        //mutate series
    }

    const goToRace = async (raceId: string) => {
        Router.push('/Race/' + raceId)
    }

    const saveSeriesSettings = (e: ChangeEvent<HTMLInputElement>) => {
        let newSeriesData: SeriesDataType = window.structuredClone(series)
        console.log(newSeriesData)
        newSeriesData.settings[e.target.id] = parseInt(e.target.value)
        //mutate series

        updateRanges()
    }

    const updateRanges = () => {
        const range = document.getElementById('numberToCount') as HTMLInputElement
        const rangeV = document.getElementById('rangeV') as HTMLInputElement
        const newValue = Number((parseInt(range.value) - parseInt(range.min)) * 100 / (parseInt(range.max) - parseInt(range.min)))
        const newPosition = 10 - (newValue * 0.2);
        rangeV.innerHTML = `<span>${range.value}</span>`;
        rangeV.style.left = `calc(${newValue}% + (${newPosition}px))`;
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
    if (userIsValidating || clubIsValidating || seriesIsValidating || boatsIsValidating || seriesIsError || series == undefined || club == undefined || user == undefined || boats == undefined) {
        return (
            <PageSkeleton />
        )
    }
    return (
        <div className=''>
            <div id="fleetEditModal" className={"fixed z-10 left-0 top-0 w-full h-full overflow-auto bg-gray-400 backdrop-blur-sm bg-opacity-20" + (fleetModal ? "" : " hidden")} key={activeRaceId}>
                <div className="mx-40 my-20 px-10 py-5 border w-4/5 bg-gray-300 rounded-sm">
                    <div className="text-6xl font-extrabold text-gray-700 p-6 float-right cursor-pointer" onClick={() => setFleetModal(false)}>&times;</div>
                    <div className="text-6xl font-extrabold text-gray-700 p-6">Edit Fleet</div>
                    <div className="flex w-3/4">
                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold text-gray-700'>
                                Name
                            </p>
                            <input type="text" id="editFleetName" className="h-full text-2xl p-4" />
                        </div>
                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold text-gray-700'>
                                Start Delay
                            </p>
                            <input type="text" id="editFleetStartDelay" className="h-full text-2xl p-4" />
                        </div>
                    </div>
                    <div>
                        <p className="text-6xl font-extrabold text-gray-700 p-6">
                            Boats
                        </p>
                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold text-gray-700'>
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
                <p className="text-6xl font-extrabold text-gray-700 p-6">
                    {series.name}
                </p>
                <div className='p-6'>
                    <SeriesTable data={series.races} key={JSON.stringify(series)} removeRace={removeRace} goToRace={goToRace} />
                </div>
                <div className="p-6">
                    <p id='seriesAddRace' onClick={createRace} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0">
                        Add Race
                    </p>
                </div>
                <p className="text-6xl font-extrabold text-gray-700 p-6">
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
                <div className='flex flex-col px-6 w-full '>
                    <p className='text-2xl font-bold text-gray-700'>
                        Races To Count
                    </p>
                    {/* padding for range bubble */}
                    <div className='h-6'></div>
                    <div className='range-wrap'>
                        <div className='range-value' id='rangeV'></div>
                        <input type="range"
                            id='numberToCount'
                            min="1"
                            max={series.races?.length}
                            defaultValue={series.settings?.numberToCount}
                            key={series.id}
                            onChange={saveSeriesSettings}
                            onBlur={() => DB.updateSeries(series)}
                        />
                    </div>
                </div>
                <div className="mb-6">
                    <SeriesResultsTable key={JSON.stringify(series)} data={series} />
                </div>
            </div>
        </div>
    )
}