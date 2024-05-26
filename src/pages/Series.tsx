import React, { ChangeEvent, MouseEventHandler, useEffect, useState } from "react"
import Router, { useRouter } from "next/router"
import * as DB from '../components/apiMethods';
import Cookies from "js-cookie";
import Select from 'react-select';
import SeriesResultsTable from "../components/SeriesResultsTable";
import Dashboard from "../components/Dashboard";
import SeriesTable from "../components/SeriesTable";
import FleetTable from "../components/FleetTable";
import Switch from "../components/Switch";
import { set } from "cypress/types/lodash";


const raceOptions = [{ value: "Pursuit", label: "Pursuit" }, { value: "Handicap", label: "Handicap" }]

const SignOnPage = () => {

    const router = useRouter()

    const query = router.query

    var [clubId, setClubId] = useState<string>("invalid")

    var [activeRaceId, setActiveRaceId] = useState("")
    var [activeFleetId, setActiveFleetId] = useState("")


    var [club, setClub] = useState<ClubDataType>({} as ClubDataType)

    var [user, setUser] = useState<UserDataType>({} as UserDataType)

    const [boatData, setBoatData] = useState<BoatDataType[]>([])

    const [fleetModal, setFleetModal] = useState(false)

    const [options, setOptions] = useState([{ label: "", value: {} as BoatDataType }])
    const [selectedOption, setSelectedOption] = useState<object[]>([])

    const [series, setSeries] = useState<SeriesDataType>({
        id: "",
        name: "",
        clubId: "",
        settings: {
            numberToCount: 0
        },
        races: [],
        fleetSettings: [{
            id: "",
            name: "",
            boats: [],
            startDelay: 0,
            fleets: []
        } as FleetSettingsType]
    })

    const createRace = async () => {
        var race = await DB.createRace(clubId, series.id)
        console.log(race)

        setSeries(await DB.GetSeriesById(series.id))
    }

    const removeRace = async (raceId: string) => {
        let result = await DB.deleteRace(raceId)
        if (!result) { return } // failed to delete race
        let newSeriesData: SeriesDataType = window.structuredClone(series)
        let raceIndex = newSeriesData.races.findIndex(x => x.id === raceId)
        console.log(raceIndex)
        newSeriesData.races.splice(raceIndex, 1)
        console.log(newSeriesData)
        setSeries(newSeriesData)
    }

    const goToRace = async (raceId: string) => {
        router.push({ pathname: '/Race', query: { race: raceId } })
    }

    const saveSeriesSettings = (e: ChangeEvent<HTMLInputElement>) => {
        let newSeriesData: SeriesDataType = window.structuredClone(series)
        console.log(newSeriesData)
        newSeriesData.settings[e.target.id] = parseInt(e.target.value)
        setSeries(newSeriesData)

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
        setSeries(await DB.GetSeriesById(series.id))
    }

    const deleteFleet = async (fleetId: string) => {
        await DB.DeleteFleetSettingsById(fleetId)

        setSeries(await DB.GetSeriesById(series.id))
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

        //update local copy
        setSeries(await DB.GetSeriesById(series.id))

        //hide fleet edit modal
        setFleetModal(false)
    }

    const logout = async () => {
        if (confirm("Are you sure you want to log out") == true) {
            Cookies.remove('token')
            Cookies.remove('clubId')
            Router.push('/')
        }
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


    useEffect(() => {
        let seriesId = query.series as string
        setClubId(Cookies.get('clubId') || "")
        const getSeries = async () => {
            await DB.GetSeriesById(seriesId).then((seriesdata: SeriesDataType) => {
                setSeries(seriesdata)
            })
        }

        const getBoats = async () => {
            var data = await DB.getBoats(clubId)
            if (data) {
                let array = [...data]
                setBoatData(array)
                let tempoptions: { label: string; value: BoatDataType }[] = []
                array.forEach(boat => {
                    tempoptions.push({ value: boat as BoatDataType, label: boat.name })
                })
                setOptions(tempoptions)
            } else {
                console.log("could not find boats")
            }

        }
        if (seriesId != undefined) {
            getSeries()
            getBoats()
        }
    }, [router, query.series])

    useEffect(() => {
        if (clubId != "") {
            //catch if not fully updated
            if (clubId == "invalid") {
                return
            }

            const fetchClub = async () => {
                var data = await DB.GetClubById(clubId)
                if (data) {
                    setClub(data)
                } else {
                    console.log("could not fetch club settings")
                }

            }
            fetchClub()

            const fetchUser = async () => {
                var userid = Cookies.get('userId')
                if (userid == undefined) return
                var data = await DB.GetUserById(userid)
                if (data) {
                    setUser(data)
                } else {
                    console.log("could not fetch club settings")
                }

            }
            fetchUser()

        } else {
            console.log("user not signed in")
            router.push("/")
        }
    }, [clubId, router])

    useEffect(() => {
        console.log("stuff updated")
        console.log(selectedOption)
    }, [selectedOption])

    return (
        <Dashboard club={club.name} displayName={user.displayName}>
            <div className='h-full w-full overflow-y-auto'>
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
                                max={series.races.length}
                                defaultValue={series.settings.numberToCount}
                                key={series.id}
                                onChange={saveSeriesSettings}
                                onBlur={() => DB.updateSeries(series)}
                            />
                        </div>
                    </div>
                    <SeriesResultsTable key={JSON.stringify(series)} data={series} />
                </div>
            </div>
        </Dashboard >
    )
}

export default SignOnPage