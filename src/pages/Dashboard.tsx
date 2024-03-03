import React, { ChangeEvent, MouseEventHandler, useEffect, useState } from "react"
import Router, { useRouter } from "next/router"
import * as DB from '../components/apiMethods';
import Cookies from "js-cookie";
import dayjs from 'dayjs';
import Select from 'react-select';

import RaceResultsTable from '../components/RaceResultsTable';

enum raceStateType {
    running,
    stopped,
    reset,
    calculate
}

const SignOnPage = () => {

    const router = useRouter()

    const query = router.query

    var [clubId, setClubId] = useState<string>("invalid")

    var [user, setUser] = useState<UserDataType>({
        id: "",
        name: "",
        settings: {},
        permLvl: 0,
        clubId: ""

    })

    const [seriesName, setSeriesName] = useState("")

    const [boatData, setBoatData] = useState<BoatDataType[]>([])

    var [todaysRaces, setTodaysRaces] = useState<NextRaceDataType[]>([])

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

    function toggleSidebar() {
        let sidebar = document.getElementById("sidebar")
        let main = document.getElementById("main")
        if (main == undefined || sidebar == undefined) return
        if (sidebar.style.width == "0px") {
            sidebar.style.width = "350px";
            main.style.marginLeft = "350px";
        }
        else {
            sidebar.style.width = "0";
            main.style.marginLeft = "0";
        }
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

    const generateBar = () => {
        let racelist = document.getElementById("racelist")
        if (racelist == undefined) return
        while (racelist.firstChild) {
            racelist.removeChild(racelist.firstChild)
        }
        todaysRaces.forEach(data => {
            racelist?.appendChild(createChild(data))
        })
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

    const saveRaceSettings = (e: ChangeEvent<HTMLInputElement>) => {
        let newRaceData: RaceDataType = race
        newRaceData[e.target.id] = e.target.value
        setRace(newRaceData)
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

            const fetchUser = async () => {
                var userid = Cookies.get('userId')
                if (userid == undefined) return
                var data = await DB.GetUserById(userid)
                if (data) {
                    setUser(data)
                    if (data.permLvl == 2) {
                        router.push('/SignOn')
                    }
                    if (data.permLvl == 0) {
                        router.push('/AdminDashboard')
                    }
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
                } else {
                    console.log("could not find boats")
                }

            }
            fetchBoats()

            const fetchTodaysRaces = async () => {
                var data = await DB.getTodaysRaceByClubId(clubId)
                if (data) {
                    setTodaysRaces(data)
                } else {
                    console.log("could not find todays race")
                }
                if (data[0]) {
                    await DB.getRaceById(data[0].id).then((racedata: RaceDataType) => {
                        setRace(racedata)
                        DB.GetSeriesById(racedata.seriesId).then((series: SeriesDataType) => {
                            setSeriesName(series.name)
                        })
                    })
                }
            }
            fetchTodaysRaces()

        } else {
            console.log("user not signed in")
            router.push("/")
        }
    }, [clubId])

    useEffect(() => {
        generateBar()
    }, [todaysRaces])

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
        <div>
            <div id="main" className="duration-300">
                <button className="text-6xl text-black" onClick={toggleSidebar}>&#9776;</button>
                {todaysRaces.length > 0 ?
                    <div id="race">
                        <p className="text-6xl font-extrabold text-gray-700 p-6 mx-36">
                            {seriesName}: {race.number} at {race.Time}
                        </p>
                        <div className="flex w-3/4 mx-36">
                            <div className='flex flex-col px-6 w-full '>
                                <p className='text-2xl font-bold text-gray-700'>
                                    RO
                                </p>
                                <input type="text"
                                    id='OOD'
                                    className="w-full p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none"
                                    defaultValue={race.OOD}
                                    key={race.id}
                                    onChange={saveRaceSettings}
                                    onBlur={() => DB.updateRaceById(race)}
                                    placeholder={"Unknown"}
                                />
                            </div>

                            <div className='flex flex-col px-6 w-full'>
                                <p className='text-2xl font-bold text-gray-700'>
                                    ARO
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
                                    onChange={saveRaceDate}
                                    onBlur={() => DB.updateRaceById(race)}
                                />
                            </div>

                        </div>
                        <div className="flex w-3/4 mx-36">
                            <div className='flex flex-col px-6 w-full'>
                                <p className='text-2xl font-bold text-gray-700'>
                                    SO
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
                                    ASO
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
                                <div className="w-full p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none">
                                    <Select
                                        defaultValue={{ value: race.Type, label: race.Type }}
                                        key={race.Type}
                                        className='w-full' />
                                </div>
                            </div>

                        </div>
                        <div className="p-6 w-3/4 mx-36">
                            <p onClick={openRacePanel} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0">
                                Race Panel
                            </p>
                        </div>
                        <div className='p-6 w-full'>
                            <RaceResultsTable data={race.results} startTime={race.startTime} key={JSON.stringify(race.results)} deleteResult={deleteResult} updateResult={updateResult} createResult={createResult} clubId={clubId} raceId={race.id} />
                        </div>
                    </div>
                    :
                    <div>
                        <p className="text-6xl font-extrabold text-gray-700 p-6"> No Races Today</p>
                    </div>
                }
            </div>
            <div id="sidebar" className="h-full w-0 fixed top-0 left-0 bg-gray-200 overflow-x-hidden pt-10 duration-500 z-10">
                <p className="text-light p-8 block w-full duration-300 hover:text-blue text-3xl">Today&rsquo;s Races</p>
                <div id="racelist">
                    <p className="text-light p-8 block w-full duration-300 hover:text-blue text-3xl">test</p>
                </div>
                <p className="list-none select-none w-full p-4 text-lg font-extrabold text-gray-700"></p>
                <p className="list-none select-none w-full p-4 text-lg font-extrabold text-gray-700"></p>
                <p className="list-none select-none w-full p-4 text-lg font-extrabold text-gray-700"></p>
                <p onClick={logout} className="list-none select-none w-full p-4 bg-blue-600 text-lg font-extrabold text-gray-700 cursor-pointer">Log Out</p>

            </div>
        </div>
    )
}

export default SignOnPage