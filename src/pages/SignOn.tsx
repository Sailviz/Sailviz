import React, { ChangeEvent, MouseEventHandler, useEffect, useState } from "react"
import Router, { useRouter } from "next/router"
import * as DB from '../components/apiMethods';
import Cookies from "js-cookie";
import SignOnTable from "../components/SignOnTable";

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
                times: []
            },
            Position: 0,
        }],
        Type: "",
        startTime: 0,
        seriesId: ""

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

        ul.className = 'list-none select-none w-full p-4 bg-pink-300 text-lg font-extrabold text-gray-700 '

        ul.onclick = async function () {
            await DB.getRaceById(race.id).then((data: RaceDataType) => {
                setRace(data.race)
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


    return (
        <div>
            <div id="main" className="duration-300">
                <button className="text-4xl text-black" onClick={toggleSidebar}>&#9776;</button>
                {todaysRaces.length > 0 ?
                    <div>
                        <div className="text-6xl font-extrabold text-gray-700 p-6">
                            {seriesName}: {race.number} at {race.Time}
                        </div>
                        <div className="m-6" key={todaysRaces.length}>

                            <SignOnTable data={race.results} startTime={race.startTime} key={race.id} deleteResult={deleteResult} updateResult={updateResult} createResult={createResult} clubId={clubId} raceId={race.id} />
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
            </div>
        </div>
    )
}

export default SignOnPage