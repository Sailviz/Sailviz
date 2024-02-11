import { useRouter } from 'next/router'
import { ChangeEvent, useEffect, useState, useId, useCallback } from 'react';
import Dashboard from '../components/Dashboard'
import Select from 'react-select';
import dayjs from 'dayjs';
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
            pursuitLength: 0
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
        startTime: 0
    })

    var [nextRace, setNextRace] = useState<NextRaceDataType>({
        id: "",
        number: 0,
        series: {
            name: ""
        }
    })

    const [seriesData, setSeriesData] = useState<SeriesDataType[]>([])

    const [boatData, setBoatData] = useState<BoatDataType[]>([])


    //adds an entry to a race and updates database
    const createResult = async (id: string) => {
        console.log(activeRaceData)
        const entry = await DB.createResult(id)
        setActiveRaceData({ ...activeRaceData, results: activeRaceData.results.concat(entry) })
        var data = await DB.GetSeriesByClubId(clubId)
        var array = [...data]
        setSeriesData(array)
        return entry
    }

    const updateResult = async (result: ResultsDataType) => {
        console.log(result)

        await DB.updateResult(result)
        var data = await DB.GetSeriesByClubId(clubId)
        var array = [...data]
        setSeriesData(array)

        //force a race data update to restart data refresh
        setActiveRaceData({ ...activeRaceData })
    }

    const deleteResult = async (resultId: string) => {
        await DB.DeleteResultById(resultId)
        var data = await DB.GetSeriesByClubId(clubId)
        var array = [...data]
        setSeriesData(array)
    }


    const createHeader = (series: any) => {
        var li = document.createElement('li');

        var div = document.createElement('div')
        div.className = 'py-4 flex'
        var button = document.createElement('button')
        var title = document.createElement('div')
        button.className = 'px-4 z-10 relative rotate-90'
        button.innerHTML = "▶"
        button.type = "button"
        button.onclick = function (event) {
            event.stopPropagation()
            expandSeries(series.id)

        }

        div.appendChild(button)
        div.appendChild(title)
        title.innerHTML += series.name

        div.onclick = function () {
            selectSeries(li)
        }
        li.appendChild(div)

        li.id = series.id

        li.className = 'list-none w-full bg-pink-400 text-lg font-extrabold text-gray-700 cursor-pointer select-none'


        var Bar = document.getElementById("leftBar")
        if (Bar == null) {
            return
        }
        Bar.appendChild(li);
    }
    const createChild = (race: any) => {
        var ul = document.createElement('ul');
        ul.innerHTML = '<li>' + race.number + " (" + dayjs(race.Time, "YYYY-MM-DD HH:mm").format('ddd D MMM YY [at] HH:mm') + ")" + '</li>';

        ul.className = 'list-none select-none w-full p-4 bg-pink-300 text-lg font-extrabold text-gray-700 ' + race.seriesId

        ul.onclick = function () {
            selectRace(race.id)
        }

        var Parent = document.getElementById(race.seriesId)
        if (Parent == null) {
            return
        }
        Parent.appendChild(ul);
    }

    const generateBar = () => {
        removeChildren(document.getElementById("leftBar"))
        seriesData.forEach(data => {
            createHeader(data)
            data.races.sort((a: any, b: any) => {
                return a.number - b.number;
            })
            for (const race in data.races) {
                createChild(data.races[race])
            }
        })
    }

    const removeChildren = (parent: any) => {
        var children = [].slice.call(parent.children);
        children.forEach((child: any) => {
            if (child.id != 'homebutton' && child.id != 'settingsbutton') {
                parent.removeChild(child);
            }
        })
    };

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
        var settings = document.getElementById('settings')
        settings?.classList.add('hidden')
        var home = document.getElementById('home')
        home?.classList.add('hidden')
        var series = document.getElementById('series')
        series?.classList.add('hidden')
        var race = document.getElementById('race')
        race?.classList.add('hidden')
        var blank = document.getElementById('blank')
        blank?.classList.add('hidden')
    }

    const showSettings = () => {
        hidePages()
        var settings = document.getElementById('settings')
        settings?.classList.remove('hidden')
    }

    const showHome = () => {
        hidePages()
        var settings = document.getElementById('home')
        settings?.classList.remove('hidden')
    }

    const saveRaceSettings = (e: ChangeEvent<HTMLInputElement>) => {
        let newRaceData: RaceDataType = activeRaceData
        newRaceData[e.target.id] = e.target.value
        setActiveRaceData(newRaceData)
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

    const saveSeriesSettings = (e: ChangeEvent<HTMLInputElement>) => {
        let newSeriesData: SeriesDataType = activeSeriesData
        console.log(newSeriesData)
        newSeriesData.settings[e.target.id] = parseInt(e.target.value)
        // setActiveSeriesData({ ...activeSeriesData, settings: [...activeSeriesData.settings, [e.target.id]: e.target.value]  })
        setActiveSeriesData({ ...newSeriesData })

        updateRanges()
    }

    const saveClubSettings = (e: ChangeEvent<HTMLInputElement>) => {
        const tempdata = club
        tempdata.settings[e.target.id] = e.target.value
        setClub(tempdata)
    }

    const updateRanges = () => {
        const range = document.getElementById('numberToCount') as HTMLInputElement
        const rangeV = document.getElementById('rangeV') as HTMLInputElement
        const newValue = Number((parseInt(range.value) - parseInt(range.min)) * 100 / (parseInt(range.max) - parseInt(range.min)))
        const newPosition = 10 - (newValue * 0.2);
        rangeV.innerHTML = `<span>${range.value}</span>`;
        rangeV.style.left = `calc(${newValue}% + (${newPosition}px))`;
    }

    const updateBoatsToLatestRYA = async () => {
        setBoatData(await DB.getRYAPY())
        DB.setBoats(clubId, await DB.getRYAPY())
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
        var newSeries = await DB.createSeries(clubId, "new newSeries")
        newSeries.races = []
        setSeriesData(seriesData.concat(newSeries))
    }


    const createRace = async () => {
        var race = await DB.createRace(clubId, activeSeriesData.id)
        console.log(race)

        var newSeriesData: SeriesDataType[] = [...seriesData]
        console.log(newSeriesData)
        console.log(newSeriesData.findIndex(x => x.id === race.seriesId))
        newSeriesData[newSeriesData.findIndex(x => x.id === race.seriesId)]?.races.push(race)
        console.log(newSeriesData)
        setSeriesData(newSeriesData)
    }

    const removeRace = async (raceId: string) => {
        let result = await DB.deleteRace(raceId)
        if (!result) { return } // failed to delete race
        let newSeriesData: SeriesDataType[] = [...seriesData]
        var seriesIndex = newSeriesData.findIndex(y => y.id == activeSeriesData.id)
        var thisSeries = newSeriesData[seriesIndex]
        if (thisSeries == undefined) return
        let raceIndex = thisSeries.races.findIndex(x => x.id === raceId)
        console.log(raceIndex)
        newSeriesData[seriesIndex]?.races.splice(raceIndex, 1)
        console.log(newSeriesData)
        setSeriesData(newSeriesData)
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
                    var array = [...data]
                    setBoatData(array)
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
        generateBar()
        //The below works, but it causes all the folders to open
        // let timer1 = setTimeout(async () => {
        //     var data = await DB.GetSeriesByClubId(clubId)
        //     var array = [...data]
        //     setSeriesData(array)
        // }, 5000);
        // return () => {
        //     clearTimeout(timer1);
        // }
    }, [seriesData]);

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

    console.log(activeRaceData.results)
    return (
        <Dashboard club={club.name} userName={user.name}>
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
                </div>
                <div id="page" className='flex basis-9/12 h-full w-full overflow-y-auto'>
                    <div id="home" className="">
                        <p className="text-6xl font-extrabold text-gray-700 p-6">
                            Welcome to Sailing Race Manager
                        </p>
                        {nextRace != undefined ?
                            <div onClick={() => selectRace(nextRace.id)} className='className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0"'> Go to Next Race {nextRace.series.name}: {nextRace.number} </div>
                            :
                            <div />
                        }
                        <div onClick={() => router.push('/SignOn')} className='className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0"'> Open Sign on Sheet </div>

                    </div>
                    <div id="settings" className="hidden w-full">
                        <p className="text-6xl font-extrabold text-gray-700 p-6">
                            Settings
                        </p>
                        <p className='text-2xl font-bold text-gray-700 p-6'>
                            Series
                        </p>
                        <div className='p-6'>
                            <ClubTable data={seriesData} key={seriesData} deleteSeries={deleteSeries} updateSeries={updateSeries} createSeries={createSeries} />
                        </div>
                        <p className='text-2xl font-bold text-gray-700 p-6'>
                            Boats
                        </p>
                        <div className='p-6'>
                            <BoatTable data={boatData} key={boatData} updateBoat={updateBoat} deleteBoat={deleteBoat} createBoat={createBoat} />
                        </div>
                        <div className="px-5 py-1 w-3/4">
                            <p onClick={(e) => { confirm("are you sure you want to do this?") ? updateBoatsToLatestRYA() : null; }} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0">
                                Set list to latest RYA values
                            </p>
                        </div>
                        <p className='text-2xl font-bold text-gray-700 p-6'>
                            Pursuit Race Length
                        </p>
                        <div className='flex flex-col px-6 w-full '>
                            <input type="number"
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
                        <div className='flex flex-col px-6 w-full '>
                            <p className='text-2xl font-bold text-gray-700'>
                                IP Address
                            </p>
                            <input type="text"
                                id='clockIP'
                                className="w-1/3 p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none"
                                defaultValue={club.settings.clockIP}
                                onChange={saveClubSettings}
                                onBlur={() => DB.UpdateClubById(club)}
                            />
                        </div>
                    </div>
                    <div id="series" className="hidden w-full">
                        <p className="text-6xl font-extrabold text-gray-700 p-6">
                            {activeSeriesData.name}
                        </p>
                        <div className='p-6'>
                            <SeriesTable data={activeSeriesData.races} key={JSON.stringify(seriesData)} removeRace={removeRace} />
                        </div>
                        <div className="p-6">
                            <p onClick={createRace} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0">
                                Add Race
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
                                    max={activeSeriesData.races.length}
                                    defaultValue={activeSeriesData.settings.numberToCount}
                                    key={activeSeriesData.id}
                                    onChange={saveSeriesSettings}
                                    onBlur={() => DB.updateSeries(activeSeriesData)}
                                />
                            </div>
                        </div>
                        <SeriesResultsTable key={activeSeriesData.settings["numberToCount"] + activeSeriesData.id} data={activeSeriesData} clubId={clubId} />
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
                                />
                            </div>

                            <div className='flex flex-col px-6 w-full'>
                                <p className='text-2xl font-bold text-gray-700'>
                                    Type
                                </p>
                                <div className="w-full p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none">
                                    <Select
                                        defaultValue={{ value: activeRaceData.Type, label: activeRaceData.Type }}
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
                            <RaceResultsTable data={activeRaceData.results} startTime={activeRaceData.startTime} key={JSON.stringify(activeRaceData.results)} deleteResult={deleteResult} updateResult={updateResult} createResult={createResult} clubId={clubId} raceId={activeRaceData.id} />
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