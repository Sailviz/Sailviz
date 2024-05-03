import { useRouter } from 'next/router'
import { ChangeEvent, useEffect, useState, useId, useCallback } from 'react';
import Dashboard from '../components/Dashboard'
import Select from 'react-select';
import dayjs, { unix } from 'dayjs';
import SeriesTable from '../components/SeriesTable';
import ClubTable from '../components/ClubTable';
import BoatTable from '../components/BoatTable';
import RaceResultsTable from '../components/RaceResultsTable';
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
        startTime: 0,
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

    const [selectedOption, setSelectedOption] = useState({ label: "", value: {} as BoatDataType })

    const [options, setOptions] = useState([{ label: "", value: {} as BoatDataType }])

    const updateResult = async (result: ResultsDataType) => {
        console.log(result)

        await DB.updateResult(result)
        var data = await DB.GetSeriesByClubId(clubId)
        var array = [...data]
        setSeriesData(array)

        //force a race data update to restart data refresh
        setActiveRaceData({ ...activeRaceData })
    }

    const editUpdateResult = async () => {
        let result = activeRaceData.results.find((result) => result.id == activeResultId) as ResultsDataType
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
            var unixTime = seconds + activeRaceData.startTime
            result.lapTimes.times[index] = unixTime

            if (index == laps.length - 1) {
                result.finishTime = unixTime
            }
        });

        DB.updateResult(result)

        setActiveRaceData({ ...activeRaceData }) //force update as content has changed

        hideEditModal()
    }

    const deleteResult = async (resultId: string) => {
        await DB.DeleteResultById(resultId)
        var data = await DB.GetSeriesByClubId(clubId)
        var array = [...data]
        setSeriesData(array)
    }

    const selectSeries = async (element: any) => {
        hidePages()
        var series = document.getElementById('series')
        if (series == null) { return }
        //set active series
        seriesData.forEach(data => {
            if (data.id == element.id) {
                setActiveSeriesData(data)
            }
        })
        series.classList.remove('hidden')
    }

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

    const expandSeries = (id: any) => {
        var title = document.getElementById(id)
        var titleText = title?.firstElementChild?.firstElementChild
        var children = document.getElementsByClassName(id) as unknown as HTMLElement[]
        console.log(children)
        for (const child of children) {
            if (child.style.display == 'none') {
                //show
                child.style.display = 'block'
                if (titleText) {
                    titleText.classList.add('rotate-90')
                    titleText.classList.remove('rotate-0')
                }

            } else {
                //hide
                child.style.display = 'none'
                if (titleText) {
                    titleText.classList.add('rotate-0')
                    titleText.classList.remove('rotate-90')
                }
            }
        }

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

    const saveRaceSettings = (e: ChangeEvent<HTMLInputElement>) => {
        let newRaceData: RaceDataType = activeRaceData

        const sentence = e.target.value.split(' ');
        const cursorPos = e.target.selectionStart
        const capitalizedWords = sentence.map(word => word.charAt(0).toUpperCase() + word.slice(1));
        const calitalisedSentence = capitalizedWords.join(' ')

        newRaceData[e.target.id] = calitalisedSentence
        setActiveRaceData(newRaceData)

        let inputElement = document.getElementById(e.target.id) as HTMLInputElement
        inputElement.value = calitalisedSentence
        inputElement.selectionStart = cursorPos
    }
    const saveRaceType = async (newValue: any) => {
        console.log(newValue)
        setActiveRaceData({ ...activeRaceData, Type: newValue.value })
        await DB.updateRaceById({ ...activeRaceData, Type: newValue.value })
        var data = await DB.GetSeriesByClubId(clubId)
        var array = [...data]
        setSeriesData(array)
    }

    const saveRaceDate = (e: ChangeEvent<HTMLInputElement>) => {
        var time = e.target.value
        time = time.replace('T', ' ')
        var day = dayjs(time)
        if (day.isValid()) {
            setActiveRaceData({ ...activeRaceData, Time: time })
        } else {
            console.log("date is not valid input")
        }
    }

    const saveClubSettings = (e: ChangeEvent<HTMLInputElement>) => {
        const tempdata = club
        tempdata.settings[e.target.id] = e.target.value
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

    const openRacePanel = async () => {
        if (activeRaceData.Type == "Handicap") {
            router.push({ pathname: '/HRace', query: { race: activeRaceData.id } })

        } else {
            router.push({ pathname: '/PRace', query: { race: activeRaceData.id } })
        }
    }

    const generateResults = async () => {
        var currentRace = activeRaceData
        var csvRows = []
        const headers = ['HelmName', 'CrewName', 'Class', 'SailNo', 'Laps', 'Elapsed', 'Code']

        csvRows.push(headers.join(','));

        currentRace.results.forEach(data => {
            var time = new Date((data.finishTime - currentRace.startTime) * 1000).toISOString().substring(11, 19)
            var values = [data.Helm, data.Crew, data.boat.name, data.SailNumber, data.lapTimes.number, (data.finishTime == -1 ? '' : time), (data.finishTime == -1 ? 'RET' : '')]
            csvRows.push(values.join(','))
        })
        downloadResults(csvRows.join('\n'))
    }

    const downloadResults = async (data: any) => {
        // Creating a Blob for having a csv file format  
        // and passing the data with type 
        const blob = new Blob([data], { type: 'text/csv' });

        // Creating an object for downloading url 
        const url = window.URL.createObjectURL(blob)

        // Creating an anchor(a) tag of HTML 
        const a = document.createElement('a')

        // Passing the blob downloading url  
        a.setAttribute('href', url)

        // Setting the anchor tag attribute for downloading 
        // and passing the download file name 
        a.setAttribute('download', activeSeriesData.name + ' ' + activeRaceData.number + ' ' + 'results.csv');

        // Performing a download with click 
        a.click()
    }

    const showEditModal = async (resultId: string) => {
        console.log(resultId)
        let result = activeRaceData.results.find((result) => result.id == resultId)

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
        modal!.classList.remove("hidden")
        console.log(modal!.classList)
        setActiveResultId(resultId.toString())

    }

    const hideEditModal = async () => {
        const modal = document.getElementById("editModal")
        modal?.classList.add("hidden")
    }

    const addLap = async () => {
        let result = activeRaceData.results.find((result) => result.id == activeResultId)
        result.lapTimes.times.push(0)
        result.lapTimes.number = result.lapTimes.number + 1

        DB.updateResult(result)

        var data = await DB.GetSeriesByClubId(clubId)
        var array = [...data]
        setSeriesData(array)
    }

    const removeLap = async (index: number) => {
        let result = activeRaceData.results.find((result) => result.id == activeResultId)
        result.lapTimes.times.splice(index, 1)
        result.lapTimes.number = result.lapTimes.number - 1

        DB.updateResult(result)

        var data = await DB.GetSeriesByClubId(clubId)
        var array = [...data]
        setSeriesData(array)
    }


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


            const getNextRace = async () => {
                setNextRace(await DB.getNextRaceByClubId(clubId))
            }

            getNextRace()

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
                                    {(activeRaceData.results.find((result) => result.id == activeResultId) || { lapTimes: { times: [] } }).lapTimes.times.map((time: number, index: number) => {
                                        return (
                                            <div className='flex flex-col px-6 w-min' key={time}>
                                                <p className='text-2xl font-bold text-gray-700 p-2'>
                                                    Lap {index + 1}
                                                </p>
                                                <div className='flex flex-row'>
                                                    <input type="time" className="h-full text-xl p-4" step={"1"} defaultValue={new Date((time - activeRaceData.startTime) * 1000).toISOString().substring(11, 19)} />
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
                                    <div className="text-4xl font-extrabold text-gray-700 p-6" onClick={() => router.push({ pathname: '/Series', query: { series: series.id } })}>
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

                    <div id="race" className="hidden">
                        <p className="text-6xl font-extrabold text-gray-700 p-6">
                            {activeSeriesData.name}: {activeRaceData.number}
                        </p>
                        <div className="flex w-3/4">
                            <div className='flex flex-col px-6 w-full '>
                                <p className='text-2xl font-bold text-gray-700'>
                                    RO
                                </p>
                                <input type="text"
                                    id='OOD'
                                    className="w-full p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none"
                                    defaultValue={activeRaceData.OOD}
                                    key={activeRaceData.id}
                                    onChange={saveRaceSettings}
                                    onBlur={() => DB.updateRaceById(activeRaceData)}
                                    placeholder='Unknown'
                                />
                            </div>

                            <div className='flex flex-col px-6 w-full'>
                                <p className='text-2xl font-bold text-gray-700'>
                                    ARO
                                </p>
                                <input type="text"
                                    id='AOD'
                                    className="w-full p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none"
                                    defaultValue={activeRaceData.AOD}
                                    key={activeRaceData.id}
                                    onChange={saveRaceSettings}
                                    onBlur={() => DB.updateRaceById(activeRaceData)}
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
                                    defaultValue={dayjs(activeRaceData.Time).format('YYYY-MM-DDTHH:ss')}
                                    key={activeRaceData.id}
                                    onChange={saveRaceDate}
                                    onBlur={() => DB.updateRaceById(activeRaceData)}
                                />
                            </div>
                        </div>
                        <div className="flex w-3/4">
                            <div className='flex flex-col px-6 w-full'>
                                <p className='text-2xl font-bold text-gray-700'>
                                    SO
                                </p>
                                <input type="text"
                                    id='SO'
                                    className="w-full p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none"
                                    defaultValue={activeRaceData.SO}
                                    key={activeRaceData.id}
                                    onChange={saveRaceSettings}
                                    onBlur={() => DB.updateRaceById(activeRaceData)}
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
                                    defaultValue={activeRaceData.ASO}
                                    key={activeRaceData.id}
                                    onChange={saveRaceSettings}
                                    onBlur={() => DB.updateRaceById(activeRaceData)}
                                    placeholder='Unknown'
                                />
                            </div>

                            <div className='flex flex-col px-6 w-full'>
                                <p className='text-2xl font-bold text-gray-700'>
                                    Type
                                </p>
                                <div className="w-full p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none">
                                    <Select
                                        defaultValue={{ value: activeRaceData.Type, label: activeRaceData.Type }}
                                        id='raceType'
                                        key={activeRaceData.Type}
                                        onChange={saveRaceType}
                                        instanceId={useId()}
                                        className='w-full'
                                        options={raceOptions} />
                                </div>
                            </div>

                        </div>
                        <div className="p-6 w-3/4">
                            <p onClick={openRacePanel} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0">
                                Race Panel
                            </p>
                        </div>
                        <div className='p-6 w-full'>
                            <RaceResultsTable data={activeRaceData.results} startTime={activeRaceData.startTime} key={JSON.stringify(activeRaceData.results)} deleteResult={deleteResult} updateResult={updateResult} createResult={null} clubId={clubId} raceId={activeRaceData.id} showEditModal={(id: string) => { showEditModal(id) }} />
                        </div>
                        <div className="p-6 w-3/4">
                            <p onClick={generateResults} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0">
                                Download Results
                            </p>
                        </div>
                        <div>
                            <p className="text-6xl font-extrabold text-gray-700 p-6">
                                Dev info
                            </p>
                            <p> id: {activeRaceData.id}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Dashboard>
    )
}

export default Club