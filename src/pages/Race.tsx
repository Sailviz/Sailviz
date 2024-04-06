import React, { ChangeEvent, MouseEventHandler, useEffect, useState } from "react"
import Router, { useRouter } from "next/router"
import * as DB from '../components/apiMethods';
import Cookies from "js-cookie";
import dayjs from 'dayjs';
import Select from 'react-select';

import RaceResultsTable from '../components/RaceResultsTable';
import Dashboard from "../components/Dashboard";

const raceOptions = [{ value: "Pursuit", label: "Pursuit" }, { value: "Handicap", label: "Handicap" }]

const SignOnPage = () => {

    const router = useRouter()

    const query = router.query

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
        name: "",
        settings: {},
        permLvl: 0,
        clubId: ""

    })

    const [seriesName, setSeriesName] = useState("")

    const [boatData, setBoatData] = useState<BoatDataType[]>([])

    var [activeResultId, setActiveResultId] = useState("")

    const [selectedOption, setSelectedOption] = useState({ label: "", value: {} as BoatDataType })

    const [options, setOptions] = useState([{ label: "", value: {} as BoatDataType }])

    var [race, setRace] = useState<RaceDataType>(({
        id: "",
        number: 0,
        Time: "",
        OOD: "",
        AOD: "",
        SO: "",
        ASO: "",
        results: [{
            id: "",
            raceId: "",
            Helm: "",
            Crew: "",
            boat: {
                id: "",
                name: "",
                crew: 0,
                py: 0,
                clubId: "",
            },
            SailNumber: 0,
            finishTime: 0,
            CorrectedTime: 0,
            lapTimes: {
                times: [],
                number: 0,
            },
            Position: 0,
        }],
        Type: "",
        startTime: 0,
        seriesId: "",
        series: {} as SeriesDataType
    }))

    function showHome() {
        let home = document.getElementById("HomeView")
        home?.classList.remove("hidden")

        let race = document.getElementById("RaceView")
        race?.classList.add("hidden")
    }

    function showRace(id: string) {
        let race = document.getElementById("RaceView")
        race?.classList.remove("hidden")

        let home = document.getElementById("HomeView")
        home?.classList.add("hidden")
    }

    const createChild = (race: NextRaceDataType) => {
        var ul = document.createElement('ul');

        ul.className = 'list-none select-none w-full p-4 bg-pink-300 text-lg font-extrabold text-gray-700 cursor-pointer my-2'

        ul.onclick = async function () {
            await DB.getRaceById(race.id).then((data: RaceDataType) => {
                setRace(data)
            })
            setSeriesName(race.series.name)
        }

        ul.innerHTML = race.series.name + ": " + race.number.toString()

        return ul
    }

    const createResult = async (id: string) => {
        const entry = await DB.createResult(id)
        setRace({ ...race, results: race.results.concat(entry) })
        return entry
    }

    const updateResult = async (result: ResultsDataType) => {
        await DB.updateResult(result)
        var data = await DB.getRaceById(race.id)
        setRace(data)
    }

    const editUpdateResult = async () => {
        let result = race.results.find((result) => result.id == activeResultId) as ResultsDataType
        const Helm = document.getElementById('editHelm') as HTMLInputElement;
        result.Helm = Helm.value

        const Crew = document.getElementById("editCrew") as HTMLInputElement
        result.Crew = Crew.value

        result.boat = selectedOption.value

        const sailNum = document.getElementById("editSailNum") as HTMLInputElement
        result.SailNumber = sailNum.value

        const LapData = document.getElementById("LapData") as HTMLElement
        let laps = Array.from(LapData.childNodes)
        laps.pop()
        laps.forEach((element, index) => {
            let inputElement = element.childNodes[1]?.childNodes[0] as HTMLInputElement

            var parts = inputElement.value.split(':'); // split it at the colons
            if (parts[0] == undefined || parts[1] == undefined || parts[2] == undefined) return
            // minutes are 60 seconds. Hours are 60 minutes * 60 seconds.
            var seconds = (+parts[0]) * 60 * 60 + (+parts[1]) * 60 + (+parts[2]);
            var unixTime = seconds + race.startTime
            result.lapTimes.times[index] = unixTime

            if (index == laps.length - 1) {
                result.finishTime = unixTime
            }
        });

        DB.updateResult(result)

        setRace({ ...race }) //force update as content has changed

        hideEditModal()
    }

    const deleteResult = async (resultId: string) => {
        await DB.DeleteResultById(resultId)
    }

    const logout = async () => {
        if (confirm("Are you sure you want to log out") == true) {
            Cookies.remove('token')
            Cookies.remove('clubId')
            Router.push('/')
        }
    }

    //Capitalise the first letter of each word, and maintain cursor pos.
    const saveRaceSettings = (e: ChangeEvent<HTMLInputElement>) => {
        let newRaceData: RaceDataType = race
        const sentence = e.target.value.split(' ');
        const cursorPos = e.target.selectionStart
        const capitalizedWords = sentence.map(word => word.charAt(0).toUpperCase() + word.slice(1));
        const calitalisedSentence = capitalizedWords.join(' ')

        newRaceData[e.target.id] = calitalisedSentence
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
        let result = race.results.find((result) => result.id == resultId)

        setActiveResultId(resultId)

        console.log(result)
        const Helm = document.getElementById('editHelm') as HTMLInputElement;
        Helm.value = result.Helm

        const Crew = document.getElementById("editCrew") as HTMLInputElement
        Crew.value = result.Crew

        try {
            setSelectedOption({ value: result.boat, label: result.boat.name })
        } catch (error) {
            //result does not have boat assigned
        }

        const sailNum = document.getElementById("editSailNum") as HTMLInputElement
        sailNum.value = result.SailNumber

        const resultid = document.getElementById("EditResultId") as HTMLInputElement
        resultid.innerHTML = result.id


        const modal = document.getElementById("editModal")

        modal?.classList.remove("hidden")
    }

    const hideEditModal = async () => {
        const modal = document.getElementById("editModal")
        modal?.classList.add("hidden")
    }

    const addLap = async () => {
        let result = race.results.find((result) => result.id == activeResultId)
        result.lapTimes.times.push(0)
        result.lapTimes.number = result.lapTimes.number + 1

        DB.updateResult(result)

        setRace({ ...race })
    }

    const removeLap = async (index: number) => {
        let result = race.results.find((result) => result.id == activeResultId)
        result.lapTimes.times.splice(index, 1)
        result.lapTimes.number = result.lapTimes.number - 1

        DB.updateResult(result)
        setRace({ ...race })
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
            await DB.getRaceById(raceId).then((racedata: RaceDataType) => {
                setRace(racedata)
                DB.GetSeriesById(racedata.seriesId).then((series: SeriesDataType) => {
                    setSeriesName(series.name)
                })

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


        } else {
            console.log("user not signed in")
            router.push("/")
        }
    }, [clubId])


    useEffect(() => {
        let timer1 = setTimeout(async () => {
            console.log(race)
            console.log(document.activeElement?.tagName)
            if (document.activeElement?.tagName == "INPUT") {
                return
            }
            if (race.id == "") return
            console.log(race.id)
            var data = await DB.getRaceById(race.id)
            console.log(data)
            setRace({ ...data })
        }, 5000);
        return () => {
            clearTimeout(timer1);
        }
    }, [race]);


    return (
        <Dashboard club={club.name} userName={user.name}>
            <div id="race" className='h-full w-full overflow-y-auto'>
                <div id="BackToHome" onClick={() => router.push("/Dashboard")} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center w-1/12 mt-4 mx-4">
                    Back To Home
                </div>
                <div id="editModal" className="hidden fixed z-10 left-0 top-0 w-full h-full overflow-auto bg-gray-400 backdrop-blur-sm bg-opacity-20" key={activeResultId}>
                    <div className="mx-40 my-20 px-10 py-5 border w-4/5 bg-gray-300 rounded-sm">
                        <div className="text-6xl font-extrabold text-gray-700 p-6 float-right cursor-pointer" onClick={hideEditModal}>&times;</div>
                        <div className="text-6xl font-extrabold text-gray-700 p-6">Edit Entry</div>
                        <div className="flex w-3/4">
                            <div className='flex flex-col px-6 w-full'>
                                <p className='hidden' id="EditResultId">

                                </p>
                                <p className='text-2xl font-bold text-gray-700'>
                                    Helm
                                </p>
                                <input type="text" id="editHelm" name="Helm" className="h-full text-2xl p-4" />
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
                                        value={selectedOption}
                                        onChange={(choice) => setSelectedOption(choice!)}
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
                        <div>
                            <p className="text-6xl font-extrabold text-gray-700 p-6">
                                Lap Info
                            </p>
                            <div className='flex flex-row w-full flex-wrap' id='LapData'>
                                {/* this map loops through laps in results, unless it can't find any. or second argument stops errors */}
                                {(race.results.find((result) => result.id == activeResultId) || { lapTimes: { times: [] } }).lapTimes.times.map((time: number, index: number) => {
                                    return (
                                        <div className='flex flex-col px-6 w-min' key={time}>
                                            <p className='text-2xl font-bold text-gray-700 p-2'>
                                                Lap {index + 1}
                                            </p>
                                            <div className='flex flex-row'>
                                                <input type="time" className="h-full text-xl p-4" step={"1"} defaultValue={new Date((time - race.startTime) * 1000).toISOString().substring(11, 19)} />
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
                                    <p id="confirmRemove" onClick={() => { deleteResult(activeResultId); hideEditModal() }} className="cursor-pointer text-white bg-red-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-xl text-lg px-12 py-4 text-center mr-3 md:mr-0">
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
                    <div className='p-6 w-full'>
                        <RaceResultsTable data={race.results} startTime={race.startTime} key={JSON.stringify(race.results)} deleteResult={deleteResult} updateResult={updateResult} createResult={createResult} clubId={clubId} raceId={race.id} showEditModal={(id: string) => { showEditModal(id) }} />
                    </div>
                </div>
            </div>
        </Dashboard >
    )
}

export default SignOnPage