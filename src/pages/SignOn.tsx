import React, { ChangeEvent, MouseEventHandler, useEffect, useState } from "react"
import Router, { useRouter } from "next/router"
import * as DB from '../components/apiMethods';
import Cookies from "js-cookie";
import SignOnTable from "../components/SignOnTable";
import Select from 'react-select';
import { InputType } from "zlib";


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

    const [options, setOptions] = useState([{ label: "", value: {} }])

    const [selectedOption, setSelectedOption] = useState({ label: "", value: {} })


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
        const HelmElement = document.getElementById("Helm") as HTMLInputElement
        const CrewElement = document.getElementById("Crew") as HTMLInputElement
        const SailNumberElement = document.getElementById("SailNum") as HTMLInputElement
        const Boat = selectedOption.value as BoatDataType

        if (HelmElement.value == "" || CrewElement.value == "" || SailNumberElement.value == "") {
            return
        }
        if (Object.keys(Boat).length == 0) {
            console.log("boat not selected")
            return
        }
        //create a result record
        const entry = await DB.createResult(id)

        entry.Helm = HelmElement.value
        entry.Crew = CrewElement.value
        entry.boat = Boat
        entry.SailNumber = SailNumberElement.value

        //then update it with the info
        await DB.updateResult(entry)
        //update local state
        setRace({ ...race, results: race.results.concat(entry) })

        hideAddBoatModal()
    }

    const updateResult = async (result: ResultsDataType) => {
    }

    const deleteResult = async (resultId: string) => {
        console.log(resultId)
        await DB.DeleteResultById(resultId)

        setRace({ ...race, results: race.results.filter((e) => { return (e.id != resultId) }) }) //remove result with matching id by way of filtering it out.
    }

    const logout = async () => {
        if (confirm("Are you sure you want to log out") == true) {
            Cookies.remove('token')
            Cookies.remove('clubId')
            Router.push('/')
        }
    }

    const showAddBoatModal = async () => {
        const Helm = document.getElementById('Helm') as HTMLInputElement;
        Helm.value = ""

        const Crew = document.getElementById("Crew") as HTMLInputElement
        Crew.value = ""

        const sailNum = document.getElementById("SailNum") as HTMLInputElement
        sailNum.value = ""

        setSelectedOption({ label: "", value: {} })


        const modal = document.getElementById("modal")
        modal?.classList.remove("hidden")

    }

    const hideAddBoatModal = async () => {
        const modal = document.getElementById("modal")
        modal?.classList.add("hidden")
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
                    let tempoptions: { label: string; value: {} }[] = []
                    array.forEach(boat => {
                        tempoptions.push({ value: boat, label: boat.name })
                    })
                    setOptions(tempoptions)
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
                <div id="modal" className="hidden fixed z-10 left-0 top-0 w-full h-full overflow-auto bg-gray-400 backdrop-blur-sm bg-opacity-20">
                    <div className="mx-40 my-20 px-10 py-5 border w-4/5 bg-gray-300 rounded-sm">
                        <div className="text-6xl font-extrabold text-gray-700 p-6 float-right cursor-pointer" onClick={hideAddBoatModal}>&times;</div>
                        <div className="text-6xl font-extrabold text-gray-700 p-6">Add Entry</div>
                        <div className="flex w-3/4">
                            <div className='flex flex-col px-6 w-full'>
                                <p className='text-2xl font-bold text-gray-700'>
                                    Helm
                                </p>

                                <input type="text" id="Helm" className="h-full text-2xl p-4" />
                            </div>
                            <div className='flex flex-col px-6 w-full'>
                                <p className='text-2xl font-bold text-gray-700'>
                                    Crew
                                </p>

                                <input type="text" id="Crew" className="h-full text-2xl p-4" />
                            </div>
                            <div className='flex flex-col px-6 w-full'>
                                <p className='text-2xl font-bold text-gray-700'>
                                    Class
                                </p>
                                <div className="w-full p-2 mx-0 my-2">
                                    <Select
                                        id="Class"
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

                                <input type="text" id="SailNum" className="h-full text-2xl p-4" />
                            </div>
                        </div>
                        <div className=" flex justify-end mt-8">
                            <div className="p-6 w-1/4 mr-2">
                                <p onClick={() => createResult(race.id)} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0">
                                    Add
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <button className="text-6xl text-black" onClick={toggleSidebar}>&#9776;</button>
                {todaysRaces.length > 0 ?
                    <div>
                        <div className="text-6xl font-extrabold text-gray-700 p-6">
                            {seriesName}: {race.number} at {race.Time}
                        </div>
                        <div className="m-6" key={todaysRaces.length}>

                            <SignOnTable data={race.results} key={JSON.stringify(race)} startTime={race.startTime} deleteResult={deleteResult} updateResult={updateResult} createResult={createResult} clubId={clubId} raceId={race.id} />
                        </div>
                    </div>
                    :
                    <div>
                        <p className="text-6xl font-extrabold text-gray-700 p-6"> No Races Today</p>
                    </div>
                }
                <div className='w-full my-0 mx-auto'>
                    <div className="p-6 w-3/4 m-auto">
                        <p onClick={showAddBoatModal} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0">
                            Add Entry
                        </p>
                    </div>
                </div>
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