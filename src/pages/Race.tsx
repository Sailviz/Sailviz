import React, { ChangeEvent, MouseEventHandler, useEffect, useState } from "react"
import Router, { useRouter } from "next/router"
import * as DB from '../components/apiMethods';
import Cookies from "js-cookie";
import dayjs from 'dayjs';
import Select from 'react-select';

import FleetResultsTable from '../components/FleetResultsTable';
import Dashboard from "../components/Dashboard";

const raceOptions = [{ value: "Pursuit", label: "Pursuit" }, { value: "Handicap", label: "Handicap" }]

const resultCodeOptions = [
    { label: 'None', value: '' },
    { label: 'Did Not Finish', value: 'DNF' },
    { label: 'Did Not Start', value: 'DNS' },
    { label: 'Disqualified', value: 'DSQ' },
    { label: 'On Course Side', value: 'OCS' },
    { label: 'Not Sailed Course', value: 'NSC' }]

const SignOnPage = () => {

    const router = useRouter()

    const query = router.query

    const [isLoading, setLoading] = useState(true)

    const [boatData, setBoatData] = useState<BoatDataType[]>([])

    var [clubId, setClubId] = useState<string>("invalid")

    var [club, setClub] = useState<ClubDataType>({
        id: "",
        name: "",
        settings: {
            clockIP: "",
            pursuitLength: 0,
            hornIP: "",
            clockOffset: 0,
        },
        series: [],
        boats: [],
    })

    var [user, setUser] = useState<UserDataType>({
        id: "",
        displayName: "",
        settings: {},
        permLvl: 0,
        clubId: ""

    })

    const [seriesName, setSeriesName] = useState("")

    var [activeResult, setActiveResult] = useState<ResultsDataType>({
        id: "",
        raceId: "",
        Helm: "",
        Crew: "",
        boat: {} as BoatDataType,
        SailNumber: "",
        finishTime: 0,
        CorrectedTime: 0,
        laps: [{
            time: 0,
            id: "",
            resultId: ""
        }],
        PursuitPosition: 0,
        HandicapPosition: 0,
        resultCode: "",
        fleetId: ""
    })

    const [boatOption, setBoatOption] = useState({ label: "", value: {} as BoatDataType })
    const [resultCodeOption, setResultCodeOption] = useState({ label: "", value: "" })

    const [options, setOptions] = useState([{ label: "", value: {} as BoatDataType }])

    var [race, setRace] = useState<RaceDataType>({
        id: "",
        number: 0,
        Time: "",
        OOD: "",
        AOD: "",
        SO: "",
        ASO: "",
        fleets: [{
            id: "",
            startTime: 0,
            raceId: "",
            fleetSettings: {
                id: "",
                name: "",
                boats: [],
                startDelay: 0,
                fleets: []
            } as FleetSettingsType,
            results: [{
                id: "",
                raceId: "",
                Helm: "",
                Crew: "",
                boat: {} as BoatDataType,
                SailNumber: "",
                finishTime: 0,
                CorrectedTime: 0,
                laps: [{
                    time: 0,
                    id: "",
                    resultId: ""
                }],
                PursuitPosition: 0,
                HandicapPosition: 0,
                resultCode: "",
                fleetId: ""
            } as ResultsDataType]

        }],
        Type: "",
        seriesId: "",
        series: {} as SeriesDataType
    })

    const createResult = async (fleetId: string) => {
        await DB.createResult(race.id, fleetId)
        setRace(await DB.getRaceById(race.id))
    }

    const updateResult = async (result: ResultsDataType) => {
        await DB.updateResult(result)
        var data = await DB.getRaceById(race.id)
        setRace(data)
    }

    const editUpdateResult = async () => {
        let result = activeResult
        const Helm = document.getElementById('editHelm') as HTMLInputElement;
        result.Helm = Helm.value

        const Crew = document.getElementById("editCrew") as HTMLInputElement
        result.Crew = Crew.value

        result.boat = boatOption.value
        console.log(result.boat)

        result.resultCode = resultCodeOption.value

        const sailNum = document.getElementById("editSailNum") as HTMLInputElement
        result.SailNumber = sailNum.value

        const Position = document.getElementById("editPosition") as HTMLInputElement
        result.HandicapPosition = parseInt(Position.value)

        const LapData = document.getElementById("LapData") as HTMLElement
        let laps = Array.from(LapData.childNodes)
        console.log(laps)
        laps.pop()
        let lapErrorFlag = false
        laps.forEach((element, index) => {
            let inputElement = element.childNodes[1]?.childNodes[0] as HTMLInputElement

            var parts = inputElement.value.split(':'); // split it at the colons
            if (parts[0] == undefined || parts[1] == undefined || parts[2] == undefined) return
            //check that time isn't 0
            if (parts[0] == "00" && parts[1] == "00" && parts[2] == "00") {
                lapErrorFlag = true
                return
            }
            // minutes are 60 seconds. Hours are 60 minutes * 60 seconds.
            var seconds = (+parts[0]) * 60 * 60 + (+parts[1]) * 60 + (+parts[2]);
            //add lap time to fleet start time
            var unixTime = seconds + race.fleets.filter(fleet => fleet.id == result.fleetId)[0]!.startTime
            result.laps[index]!.time = unixTime

            if (index == laps.length - 1) {
                result.finishTime = unixTime
            }
        });
        //check that all data is present
        if (result.Helm == "" || result.boat.id == undefined || result.SailNumber == "" || lapErrorFlag) {
            alert("missing Helm or Sail Number or Lap Time")
            return
        }

        console.log(result)
        await DB.updateResult(result)

        setRace(await DB.getRaceById(race.id)) //force update as content has changed

        const modal = document.getElementById("editModal")
        modal?.classList.add("hidden")
    }

    const deleteResult = async (resultId: string) => {
        await DB.DeleteResultById(resultId)
        setRace(await DB.getRaceById(race.id))
    }

    //Capitalise the first letter of each word, and maintain cursor pos.
    const saveRaceSettings = (e: ChangeEvent<HTMLInputElement>) => {
        let newRaceData: RaceDataType = race
        const sentence = e.target.value.split(' ');
        const cursorPos = e.target.selectionStart
        const capitalizedWords = sentence.map(word => word.charAt(0).toUpperCase() + word.slice(1));
        const calitalisedSentence = capitalizedWords.join(' ')

        // use e.target.id to update the correct field in the race data
        switch (e.target.id) {
            case "OOD":
                newRaceData.OOD = calitalisedSentence
                break;
            case "AOD":
                newRaceData.AOD = calitalisedSentence
                break;
            case "SO":
                newRaceData.SO = calitalisedSentence
                break;
            case "ASO":
                newRaceData.ASO = calitalisedSentence
                break;
            case "Time":
                newRaceData.Time = e.target.value
                break;
            case "raceType":
                newRaceData.Type = e.target.value
                break;
            default:
                break;
        }
        setRace(newRaceData)

        let inputElement = document.getElementById(e.target.id) as HTMLInputElement
        inputElement.value = calitalisedSentence
        inputElement.selectionStart = cursorPos
    }

    const saveRaceDate = (e: ChangeEvent<HTMLInputElement>) => {
        var time = e.target.value
        time = time.replace('T', ' ')
        var day = dayjs(time)
        if (day.isValid()) {
            setRace({ ...race, Time: time })
        } else {
            console.log("date is not valid input")
        }
    }

    const openRacePanel = async () => {
        if (race.Type == "Handicap") {
            router.push({ pathname: '/HRace', query: { race: race.id } })

        } else {
            router.push({ pathname: '/PRace', query: { race: race.id } })
        }
    }

    const showEditModal = async (resultId: string) => {
        console.log(resultId)
        let result: ResultsDataType | undefined;
        let results = race.fleets.flatMap(fleet => fleet.results)
        result = results.find(result => result.id == resultId)
        if (result == undefined) {
            console.error("Could not find result with id: " + resultId);
            return
        }
        console.log(result)
        result.laps.sort((a, b) => a.time - b.time)
        setActiveResult({ ...result })

        console.log(result)
        const Helm = document.getElementById("editHelm") as HTMLInputElement
        console.log(Helm.value)
        Helm.setAttribute("value", result.Helm)
        console.log(Helm.value)

        const Crew = document.getElementById("editCrew") as HTMLInputElement
        Crew.value = result.Crew


        const sailNum = document.getElementById("editSailNum") as HTMLInputElement
        sailNum.value = result.SailNumber

        const position = document.getElementById("editPosition") as HTMLInputElement
        position.value = result.HandicapPosition.toString()

        const resultid = document.getElementById("EditResultId") as HTMLInputElement
        resultid.innerHTML = result.id

        try {
            setBoatOption({ value: result.boat, label: result.boat.name })
        } catch (error) {
            //result does not have boat assigned
        }
        try {
            setResultCodeOption({ value: result.resultCode, label: resultCodeOptions.find(code => code.value == result!.resultCode!)!.label })
        } catch (error) {
            //result does not have boat assigned
        }
        const modal = document.getElementById("editModal")
        modal!.classList.remove("hidden")
    }

    const addLap = async () => {
        await DB.CreateLap(activeResult.id, 0)
        let result = await DB.GetResultById(activeResult.id)

        //order by time, but force 0 times to end
        result.laps.sort((a, b) => {
            if (a.time == 0) return 1
            if (b.time == 0) return -1
            return a.time - b.time
        })

        setActiveResult(result)
    }

    const removeLap = async (index: number) => {
        await DB.DeleteLapById(activeResult.laps[index]!.id)
        let result = await DB.GetResultById(activeResult.id)

        //order by time, but force 0 times to end
        result.laps.sort((a, b) => {
            if (a.time == 0) return 1
            if (b.time == 0) return -1
            return a.time - b.time
        })

        setActiveResult(result)
    }

    const saveRaceType = async (newValue: any) => {
        console.log(newValue)
        setRace({ ...race, Type: newValue.value })
        await DB.updateRaceById({ ...race, Type: newValue.value })
    }

    useEffect(() => {
        let raceId = query.race as string
        setClubId(Cookies.get('clubId') || "")
        const getRace = async () => {
            const racedata = await DB.getRaceById(raceId)
            setRace(racedata)
            DB.GetSeriesById(racedata.seriesId).then((series: SeriesDataType) => {
                setSeriesName(series.name)
            })
        }

        if (raceId != undefined) {
            getRace()
        }

    }, [router])

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

            const fetchBoats = async () => {
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
            fetchBoats()
            setLoading(false)

        } else {
            console.log("user not signed in")
            router.push("/")
        }
    }, [clubId])


    useEffect(() => {
        let timer1 = setTimeout(async () => {
            console.log(document.activeElement?.tagName)
            if (document.activeElement?.tagName == "INPUT") {
                return
            }
            if (race.id == "") return
            var data = await DB.getRaceById(race.id)
            setRace({ ...data })
        }, 5000);
        return () => {
            clearTimeout(timer1);
        }
    }, [race]);
    if (isLoading) {
        return (
            <p>Loading...</p>
        )
    }
    return (
        <Dashboard club={club.name} displayName={user.displayName}>
            <div id="race" className='h-full w-full overflow-y-auto'>
                <div id="editModal" className={"fixed z-10 left-0 top-0 w-full h-full overflow-auto bg-gray-400 backdrop-blur-sm bg-opacity-20 hidden"} key={activeResult.id}>
                    <div className="mx-40 my-20 px-10 py-5 border w-4/5 bg-gray-300 rounded-sm">
                        <div className="text-6xl font-extrabold text-gray-700 p-6 float-right cursor-pointer" onClick={() => { document.getElementById("editModal")!.classList.add("hidden") }}>&times;</div>
                        <div className="text-6xl font-extrabold text-gray-700 p-6">Edit Entry</div>
                        <div className="flex w-3/4">
                            <div className='flex flex-col px-6 w-full'>
                                <p className='hidden' id="EditResultId">

                                </p>
                                <p className='text-2xl font-bold text-gray-700'>
                                    Helm
                                </p>
                                <input type="text" id="editHelm" className="h-full text-2xl p-4" />
                            </div>
                            <div className='flex flex-col px-6 w-full'>
                                <p className='text-2xl font-bold text-gray-700'>
                                    Crew
                                </p>

                                <input type="text" id="editCrew" className="h-full text-2xl p-4" />
                            </div>
                            <div className='flex flex-col px-6 w-full'>
                                <p className='text-2xl font-bold text-gray-700'>
                                    Class
                                </p>
                                <div className="w-full p-2 mx-0 my-2">
                                    <Select
                                        id="editClass"
                                        className=' w-56 h-full text-3xl'
                                        options={options}
                                        value={boatOption}
                                        onChange={(choice) => setBoatOption(choice!)}
                                    />
                                </div>
                            </div>
                            <div className='flex flex-col px-6 w-full'>
                                <p className='text-2xl font-bold text-gray-700'>
                                    Sail Number
                                </p>

                                <input type="text" id="editSailNum" className="h-full text-2xl p-4" />
                            </div>
                        </div>
                        <div className="flex flex-row mt-2">
                            <div className='flex flex-col px-6 w-1/4'>
                                <p className='text-2xl font-bold text-gray-700'>
                                    Position
                                </p>

                                <input type="number" id="editPosition" className="h-full text-2xl p-4" />
                            </div>
                            <div className='flex flex-col px-6 w-1/4'>
                                <p className='text-2xl font-bold text-gray-700'>
                                    Finish Code
                                </p>
                                <div className="w-full p-2 mx-0 my-2">
                                    <Select
                                        id="editResultCode"
                                        className=' w-56 h-full text-3xl'
                                        options={resultCodeOptions}
                                        value={resultCodeOption}
                                        onChange={(choice) => setResultCodeOption(choice!)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-6xl font-extrabold text-gray-700 p-6">
                                Lap Info
                            </p>
                            <div className='flex flex-row w-full flex-wrap' id='LapData' key={JSON.stringify(activeResult)}>
                                {/* this map loops through laps in results, unless it can't find any*/}
                                {activeResult.laps.map((lap: LapDataType, index: number) => {
                                    return (
                                        <div className='flex flex-col px-6 w-min' key={lap.time + index}>
                                            <p className='text-2xl font-bold text-gray-700 p-2'>
                                                Lap {index + 1}
                                            </p>
                                            <div className='flex flex-row'>
                                                <input type="time" className="h-full text-xl p-4" step={"1"} defaultValue={new Date(Math.max(0, (lap.time - (race.fleets.find(fleet => fleet.id == activeResult.fleetId) || { startTime: 0 } as FleetDataType).startTime) * 1000)).toISOString().substring(11, 19)} />
                                                <div className="text-6xl font-extrabold text-red-600 p-6 float-right cursor-pointer" onClick={() => removeLap(index)}>&times;</div>
                                            </div>

                                        </div>
                                    )
                                })}
                                <div className="p-4 mr-2 w-96 flex justify-end">
                                    <p onClick={addLap} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xl px-12 py-4 text-center mr-3 md:mr-0">
                                        Add Lap
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-row justify-end">
                            <div className=" flex justify-end mt-8">
                                <div className="p-4 mr-2">
                                    <p id="confirmRemove" onClick={() => { deleteResult(activeResult.id); document.getElementById("editModal")!.classList.add("hidden") }} className="cursor-pointer text-white bg-red-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-xl text-lg px-12 py-4 text-center mr-3 md:mr-0">
                                        Remove
                                    </p>
                                </div>
                            </div>
                            <div className=" flex justify-end mt-8">
                                <div className="p-4 mr-2">
                                    <p id="confirmEdit" onClick={editUpdateResult} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xl px-12 py-4 text-center mr-3 md:mr-0">
                                        update
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-36 pb-36">
                    <p className="text-6xl font-extrabold text-gray-700 p-6">
                        {seriesName}: {race.number}
                    </p>
                    <div className="flex w-full">

                        <div className='flex flex-col px-6 w-full '>
                            <p className='text-2xl font-bold text-gray-700'>
                                Race Officer
                            </p>
                            <input type="text"
                                id='OOD'
                                className="w-full p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none"
                                defaultValue={race.OOD}
                                key={race.id}
                                onChange={(e) => saveRaceSettings(e)}
                                onBlur={() => DB.updateRaceById(race)}
                                placeholder={"Unknown"}
                            />
                        </div>

                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold text-gray-700'>
                                Assistant Race Officer
                            </p>
                            <input type="text"
                                id='AOD'
                                className="w-full p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none"
                                defaultValue={race.AOD}
                                key={race.id}
                                onChange={saveRaceSettings}
                                onBlur={() => DB.updateRaceById(race)}
                                placeholder='Unknown'
                            />

                        </div>

                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold text-gray-700'>
                                Time
                            </p>
                            <input type="datetime-local"
                                id='Time'
                                className="w-full p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none"
                                defaultValue={dayjs(race.Time).format('YYYY-MM-DDTHH:ss')}
                                key={race.id}
                            />
                        </div>

                    </div>
                    <div className="flex w-full">
                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold text-gray-700'>
                                Safety Officer
                            </p>
                            <input type="text"
                                id='SO'
                                className="w-full p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none"
                                defaultValue={race.SO}
                                key={race.id}
                                onChange={saveRaceSettings}
                                onBlur={() => DB.updateRaceById(race)}
                                placeholder='Unknown'
                            />
                        </div>

                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold text-gray-700'>
                                Assistant Safety Officer
                            </p>
                            <input type="text"
                                id='ASO'
                                className="w-full p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none"
                                defaultValue={race.ASO}
                                key={race.id}
                                onChange={saveRaceSettings}
                                onBlur={() => DB.updateRaceById(race)}
                                placeholder='Unknown'
                            />
                        </div>

                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold text-gray-700'>
                                Type
                            </p>
                            <Select
                                defaultValue={{ value: race.Type, label: race.Type }}
                                id='raceType'
                                key={race.Type}
                                onChange={saveRaceType}
                                className='w-full'
                                options={raceOptions} />
                        </div>

                    </div>
                    <div className="p-6 w-full">
                        <p onClick={openRacePanel} id="RacePanelButton" className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0">
                            Race Panel
                        </p>
                    </div>
                    <div className="p-6 w-full">
                    </div>
                    <div className='p-6 w-full'>
                        {race.fleets.map((fleet, index) => {
                            return (
                                <div key={"fleetResults" + index}>
                                    <p className='text-2xl font-bold text-gray-700'>
                                        {fleet.fleetSettings.name}
                                    </p>
                                    <FleetResultsTable showTime={true} editable={true} data={fleet.results} startTime={fleet.startTime} key={JSON.stringify(race)} deleteResult={deleteResult} updateResult={updateResult} raceId={race.id} showEditModal={(id: string) => { showEditModal(id) }} />
                                    <p onClick={() => createResult(fleet.id)} id="RacePanelButton" className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0 my-5">
                                        Add Result
                                    </p>
                                </div>
                            )
                        })
                        }
                    </div>
                </div>
            </div>
        </Dashboard >
    )
}
export default SignOnPage