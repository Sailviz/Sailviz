import { useRouter } from 'next/router'
import { ChangeEvent, useEffect, useState, useId, useCallback } from 'react';
import Dashboard from '../components/Dashboard'
import Select from 'react-select';
import dayjs, { unix } from 'dayjs';
import SeriesTable from '../components/SeriesTable';
import ClubTable from '../components/ClubTable';
import BoatTable from '../components/BoatTable';
import * as DB from '../components/apiMethods';
import Cookies from 'js-cookie';
import SeriesResultsTable from '../components/SeriesResultsTable';

const raceOptions = [{ value: "Pursuit", label: "Pursuit" }, { value: "Handicap", label: "Handicap" }]

const Club = () => {
    const router = useRouter()
    var [clubId, setClubId] = useState<string>("invalid")
    var [club, setClub] = useState<ClubDataType>({
        id: "",
        name: "",
        settings: {
            clockIP: "",
            pursuitLength: 0,
            hornIP: "",
            clockOffset: 0
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

    var [activeSeriesData, setActiveSeriesData] = useState<SeriesDataType>({
        id: "",
        name: "",
        clubId: "",
        settings: {
            numberToCount: 0
        },
        races: []
    })
    var [activeRaceData, setActiveRaceData] = useState<RaceDataType>({
        id: "",
        number: 0,
        Time: "",
        OOD: "",
        AOD: "",
        SO: "",
        ASO: "",
        results: [],
        Type: "",
        seriesId: "",
        series: {} as SeriesDataType
    })

    var [activeResultId, setActiveResultId] = useState("")

    var [nextRace, setNextRace] = useState<NextRaceDataType>({
        id: "",
        number: 0,
        Time: "",
        series: {
            name: ""
        }
    })

    const [seriesData, setSeriesData] = useState<SeriesDataType[]>([])

    const [boatData, setBoatData] = useState<BoatDataType[]>([])

    const [options, setOptions] = useState([{ label: "", value: {} as BoatDataType }])

    const selectRace = async (raceId: string) => {
        console.log(raceId)
        hidePages()
        //set active race
        console.log(seriesData)
        seriesData.forEach(series => {
            var races = series.races
            console.log(races)
            if (!races) return
            races.forEach(race => {
                if (race.id == raceId) {
                    console.log(race)
                    console.log(series)
                    setActiveRaceData(race)
                    setActiveSeriesData(series)
                }
            })
        })
        var race = document.getElementById('race')
        if (race == null) { return }
        race.classList.remove('hidden')
    }


    const hidePages = () => {
        var settingsPage = document.getElementById('settings')
        settingsPage?.classList.add('hidden')
        var homePage = document.getElementById('home')
        homePage?.classList.add('hidden')
        var seriesPage = document.getElementById('allSeries')
        seriesPage?.classList.add('hidden')
        var racePage = document.getElementById('allRaces')
        racePage?.classList.add('hidden')
    }

    const showSettings = () => {
        hidePages()
        var settingsPage = document.getElementById('settings')
        settingsPage?.classList.remove('hidden')
    }

    const showHome = () => {
        hidePages()
        var homePage = document.getElementById('home')
        homePage?.classList.remove('hidden')
    }

    const showSeries = () => {
        hidePages()
        var seriespage = document.getElementById('allSeries')
        seriespage?.classList.remove('hidden')
    }

    const showRaces = () => {
        hidePages()
        var racesPage = document.getElementById('allRaces')
        racesPage?.classList.remove('hidden')
    }


    const saveClubSettings = (e: ChangeEvent<HTMLInputElement>) => {
        const tempdata = club
        // use e.target.id to update the correct field in the club data
        switch (e.target.id) {
            case 'pursuitLength':
                tempdata.settings.pursuitLength = parseInt(e.target.value)
                break
            case 'clockIP':
                tempdata.settings.clockIP = e.target.value
                break
            case 'clockOffset':
                tempdata.settings.clockOffset = parseInt(e.target.value)
                break
            case 'hornIP':
                tempdata.settings.hornIP = e.target.value
                break
        }
        setClub(tempdata)
    }

    const updateBoat = async (boat: BoatDataType) => {
        const tempdata = boatData
        tempdata[tempdata.findIndex((x: BoatDataType) => x.id === boat.id)] = boat
        setBoatData([...tempdata])
        await DB.updateBoatById(boat)
    }

    const deleteBoat = async (boat: BoatDataType) => {
        const tempdata = boatData
        tempdata.splice(tempdata.findIndex((x: BoatDataType) => x.id === boat.id), 1)
        setBoatData([...tempdata])
        await DB.deleteBoatById(boat.id)
    }

    const createBoat = async () => {
        const tempdata = boatData
        const Boat: BoatDataType = await DB.createBoat("", 0, 0, clubId)
        console.log(Boat)
        if (Boat) {
            setBoatData([Boat, ...tempdata])
        } else {
            alert("something went wrong")
        }
    }

    const createSeries = async () => {
        var newSeries = await DB.createSeries(clubId, "NewSeries")
        newSeries.races = []
        setSeriesData(seriesData.concat(newSeries))
    }




    const updateSeries = async (series: SeriesDataType) => {
        const tempdata = seriesData
        tempdata[tempdata.findIndex((x: SeriesDataType) => x.id === series.id)] = series
        setSeriesData([...tempdata])
        await DB.updateSeries(series)
    }

    const deleteSeries = async (series: SeriesDataType) => {
        console.log("updating main copy of series")
        let newSeriesData: SeriesDataType[] = seriesData
        newSeriesData.splice(newSeriesData.findIndex(y => y.id == series.id), 1)
        console.log(newSeriesData)
        setSeriesData([...newSeriesData])
        await DB.deleteSeries(series)
    }

    // const generateResults = async () => {
    //     var currentRace = activeRaceData
    //     var csvRows = []
    //     const headers = ['HelmName', 'CrewName', 'Class', 'SailNo', 'Laps', 'Elapsed', 'Code']

    //     csvRows.push(headers.join(','));

    //     currentRace.results.forEach(data => {
    //         var time = new Date((data.finishTime - currentRace.startTime) * 1000).toISOString().substring(11, 19)
    //         var values = [data.Helm, data.Crew, data.boat.name, data.SailNumber, data.lapTimes.number, (data.finishTime == -1 ? '' : time), (data.finishTime == -1 ? 'RET' : '')]
    //         csvRows.push(values.join(','))
    //     })
    //     downloadResults(csvRows.join('\n'))
    // }

    // const downloadResults = async (data: any) => {
    //     // Creating a Blob for having a csv file format  
    //     // and passing the data with type 
    //     const blob = new Blob([data], { type: 'text/csv' });

    //     // Creating an object for downloading url 
    //     const url = window.URL.createObjectURL(blob)

    //     // Creating an anchor(a) tag of HTML 
    //     const a = document.createElement('a')

    //     // Passing the blob downloading url  
    //     a.setAttribute('href', url)

    //     // Setting the anchor tag attribute for downloading 
    //     // and passing the download file name 
    //     a.setAttribute('download', activeSeriesData.name + ' ' + activeRaceData.number + ' ' + 'results.csv');

    //     // Performing a download with click 
    //     a.click()
    // }


    useEffect(() => {
        setClubId(Cookies.get('clubId') || "")
    }, [])

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
                    if (data.permLvl !== 0) {
                        router.push('/Dashboard')
                    }
                } else {
                    console.log("could not fetch club settings")
                }

            }
            fetchUser()

            const fetchRaces = async () => {
                var data = await DB.GetSeriesByClubId(clubId)
                var array = [...data]
                setSeriesData(array)
            }
            fetchRaces()

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
    }, [clubId, router])

    useEffect(() => {
        let timer1 = setTimeout(async () => {
            console.log(activeRaceData)
            console.log(document.activeElement?.tagName)
            if (document.activeElement?.tagName == "INPUT") {
                return
            }
            if (activeRaceData.id == "") return
            console.log(activeRaceData.id)
            var data = await DB.getRaceById(activeRaceData.id)
            console.log(data)
            setActiveRaceData({ ...data })
        }, 5000);
        return () => {
            clearTimeout(timer1);
        }
    }, [activeRaceData]);


    return (
        <Dashboard club={club.name} displayName={user.displayName}>
            <div className="w-full flex flex-row items-center justify-start panel-height">
                <div id="leftBar" className='flex basis-3/12 flex-col justify-start h-full border-pink-500 border-r-2 overflow-y-auto'>
                    <div id="settingsbutton" className='w-full flex cursor-pointer' onClick={showSettings}>
                        <div className='w-full p-4 bg-pink-500 text-lg font-extrabold text-gray-700 over'>
                            <p>Settings</p>
                        </div>
                    </div>
                    <div id='homebutton' className='w-full flex cursor-pointer' onClick={showHome}>
                        <div className='w-full p-4 bg-pink-500 text-lg font-extrabold text-gray-700 over'>
                            <p>Home</p>
                        </div>
                    </div>
                    <div id='seriesbutton' className='w-full flex cursor-pointer' onClick={showSeries}>
                        <div className='w-full p-4 bg-pink-500 text-lg font-extrabold text-gray-700 over'>
                            <p>All Series</p>
                        </div>
                    </div>
                    <div id='racesbutton' className='w-full flex cursor-pointer' onClick={showRaces}>
                        <div className='w-full p-4 bg-pink-500 text-lg font-extrabold text-gray-700 over'>
                            <p>All Races</p>
                        </div>
                    </div>
                </div>
                <div id="page" className='flex basis-9/12 h-full w-full overflow-y-auto'>
                    <div id="home" className="">
                        <p className="text-6xl font-extrabold text-gray-700 p-6">
                            Welcome to Sailing Race Manager
                        </p>
                        {nextRace != undefined ?
                            <div onClick={() => selectRace(nextRace.id)} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0"> Go to Next Race {nextRace.series.name}: {nextRace.number} </div>
                            :
                            <div />
                        }
                        <div onClick={() => router.push('/SignOn')} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-md px-5 py-2.5 text-center mr-3 md:mr-0 font-extrabold tracking-wide"> Open Sign on Sheet </div>

                    </div>
                    <div id="allSeries" className='hidden'>
                        {/* map series to buttons. */}
                        {seriesData.map((series, index) => {
                            return (
                                <div className="m-6" key={JSON.stringify(series.id)}>
                                    <div className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-md px-5 py-2.5 text-center mr-3 md:mr-0 font-extrabold tracking-wide"
                                        onClick={() => router.push({ pathname: '/Series', query: { series: series.id } })}
                                    >
                                        {series.name}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div id="allRaces" className='hidden'>

                    </div>
                    <div id="settings" className="hidden w-full">
                        <p className="text-6xl font-extrabold text-gray-700 p-6">
                            Settings
                        </p>
                        <p className='text-2xl font-bold text-gray-700 p-6'>
                            Series
                        </p>
                        <div className='p-6'>
                            <ClubTable data={seriesData} key={JSON.stringify(seriesData)} deleteSeries={deleteSeries} updateSeries={updateSeries} createSeries={createSeries} />
                        </div>
                        <p className='text-2xl font-bold text-gray-700 p-6'>
                            Boats
                        </p>
                        <div className='p-6'>
                            <BoatTable data={boatData} key={boatData} updateBoat={updateBoat} deleteBoat={deleteBoat} createBoat={createBoat} />
                        </div>
                        <p className='text-2xl font-bold text-gray-700 p-6'>
                            Pursuit Race Length
                        </p>
                        <div className='flex flex-col px-6 w-full '>
                            <input type="text"
                                id='pursuitLength'
                                className="w-1/3 p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none"
                                defaultValue={club.settings.pursuitLength}
                                onChange={saveClubSettings}
                                onBlur={() => DB.UpdateClubById(club)}
                            />
                        </div>
                        <p className='text-2xl font-bold text-gray-700 p-6'>
                            Clock Config
                        </p>
                        <div className='flex flex-row px-6 w-full '>
                            <p className='text-2xl font-bold text-gray-700 my-auto mx-4'>
                                IP Address
                            </p>
                            <input type="text"
                                id='clockIP'
                                className="w-1/3 p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none"
                                defaultValue={club.settings.clockIP}
                                onChange={saveClubSettings}
                                onBlur={() => DB.UpdateClubById(club)}
                            />
                            <p className='text-2xl font-bold text-gray-700 my-auto mx-4'>
                                Offset
                            </p>
                            <input type="text"
                                id='clockOffset'
                                className="w-1/3 p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none"
                                defaultValue={club.settings.clockOffset}
                                onChange={saveClubSettings}
                                onBlur={() => DB.UpdateClubById(club)}
                            />
                        </div>
                        <p className='text-2xl font-bold text-gray-700 p-6'>
                            Horn Config
                        </p>
                        <div className='flex flex-col px-6 w-full '>
                            <p className='text-2xl font-bold text-gray-700'>
                                IP Address
                            </p>
                            <input type="text"
                                id='hornIP'
                                className="w-1/3 p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none"
                                defaultValue={club.settings.hornIP}
                                onChange={saveClubSettings}
                                onBlur={() => DB.UpdateClubById(club)}
                            />
                        </div>
                        <div onClick={() => { throw new Error("custom error") }} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-md px-5 py-2.5 text-center mr-3 md:mr-0 font-extrabold tracking-wide"> make an error </div>

                    </div>
                </div>
            </div>
        </Dashboard>
    )
}

export default Club