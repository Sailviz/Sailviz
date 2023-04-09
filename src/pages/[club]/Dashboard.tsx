import { useRouter } from 'next/router'
import { ChangeEvent, useEffect, useState, useId } from 'react';
import Dashboard from '../../components/Dashboard'
import Select from 'react-select';
import dayjs from 'dayjs';
import SeriesTable from '../../components/SeriesTable';
import ClubTable from '../../components/ClubTable';
import BoatTable from '../../components/BoatTable';
import RaceResultsTable from '../../components/RaceResultsTable';
import * as DB from '../../components/apiMethods';


type RaceDataType = {
    [key: string]: any,
    id: string,
    number: number,
    OOD: string,
    AOD: string,
    SO: string,
    ASO: string,
    results: ResultsDataType[],
    Time: string,
    Type: string,
    seriesId: string
};

type SeriesDataType = {
    [key: string]: any,
    id: string,
    name: string,
    clubId: string,
    settings: SettingsType,
    races: RaceDataType[]
}

type ResultsDataType = {
    [key: string]: any,
    Helm: string,
    Crew: string,
    BoatClass: string,
    BoatNumber: string,
    Time: number,
    Laps: number,
    Position: number
}

type SettingsType = {
    [key: string]: any,
    numberToCount: number
}

type BoatDataType = {
    id: string,
    name: string,
    crew: number,
    py: number
}

const raceOptions = [{ value: "Pursuit", label: "Pursuit" }, { value: "Handicap", label: "Handicap" }]

const Club = () => {
    const router = useRouter()
    var club: string = router.query.club as string

    var [activeSeriesData, setActiveSeriesData] = useState<SeriesDataType>({
        "id": "",
        "name": "",
        "clubId": "",
        "settings": {
            "numberToCount": 0
        },
        "races": []
    })
    var [activeRaceData, setActiveRaceData] = useState<RaceDataType>(({
        "id": "",
        "number": 0,
        "dateTime": "",
        "OOD": "",
        "AOD": "",
        "SO": "",
        "ASO": "",
        "results": [{
            "Helm": "",
            "Crew": "",
            "BoatClass": "",
            "BoatNumber": "",
            "Time": 0,
            "Laps": 0,
            "Position": 0
        }],
        "Time": "",
        "Type": "",
        "seriesId": ""
    }))

    var [seriesData, setSeriesData] = useState<SeriesDataType[]>([])

    var [boatData, setBoatData] = useState<BoatDataType[]>([])

    var [updateState, setUpdateState] = useState(0)


    //adds an entry to a race and updates database
    const addRaceEntry = async (id: string) => {
        let newRaceData: RaceDataType = activeRaceData
        const entry: ResultsDataType = {
            Helm: "",
            Crew: "",
            BoatClass: "",
            BoatNumber: "",
            Time: 0,
            Laps: 0,
            Position: 0
        }
        newRaceData.results.push(entry)
        setActiveRaceData(newRaceData)
        DB.updateRaceSettings(newRaceData)
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
        for (const element in seriesData) {
            var data = seriesData[element]
            if (data == undefined || data.races == undefined) { return }
            createHeader(data)
            data.races.sort((a: any, b: any) => {
                return a.number - b.number;
            })
            for (const race in data.races) {
                createChild(data.races[race])
            }
        }
    }

    const removeChildren = (parent: any) => {
        while (parent.childElementCount > 1) {
            parent.removeChild(parent.lastChild);
        }
    };

    const selectSeries = async (element: any) => {
        hidePages()
        var series = document.getElementById('series')
        if (series == null) { return }
        //set active series
        for (var s = 0; s < seriesData.length; s++) {
            if (seriesData[s]?.id == element.id) {
                if (seriesData[s] != undefined) {
                    setActiveSeriesData(seriesData[s] as SeriesDataType)
                }
            }
        }
        series.classList.remove('hidden')
    }

    const selectRace = async (raceId: string) => {
        console.log(raceId)
        hidePages()
        //set active race
        console.log(seriesData)
        for (var s = 0; s < seriesData.length; s++) {
            var races = seriesData[s]?.races
            if (!races) return
            for (var r = 0; r < races.length; r++) {
                if (races[r]?.id == raceId) {
                    if (races[r] != undefined) {
                        setActiveRaceData(races[r] as RaceDataType)
                        setActiveSeriesData(seriesData[s] as SeriesDataType)
                        console.log(activeRaceData)
                    }
                }
            }
        }
        var race = document.getElementById('race')
        if (race == null) { return }
        race.classList.remove('hidden')
    }

    const expandSeries = (id: any) => {
        var title = document.getElementById(id)
        var titleText = title?.firstElementChild?.firstElementChild
        if (titleText == null) { return }
        var children = document.getElementsByClassName(id) as unknown as HTMLElement[]
        for (var i = 0; i < children.length; i++) {
            var child = children[i]
            if (!child) { return }

            if (child.style.display == 'none') {
                //show
                child.style.display = 'block'
                titleText.classList.add('rotate-90')
                titleText.classList.remove('rotate-0')

            } else {
                //hide
                child.style.display = 'none'
                titleText.classList.add('rotate-0')
                titleText.classList.remove('rotate-90')
            }
        }

    }
    const hidePages = () => {
        var settings = document.getElementById('settings')
        settings?.classList.add('hidden')
        var series = document.getElementById('series')
        series?.classList.add('hidden')
        var race = document.getElementById('race')
        race?.classList.add('hidden')
    }

    const showSettings = () => {
        hidePages()
        var settings = document.getElementById('settings')
        settings?.classList.remove('hidden')
    }

    const saveRaceSettings = (e: ChangeEvent<HTMLInputElement>) => {
        let newRaceData: RaceDataType = activeRaceData
        newRaceData[e.target.id] = e.target.value
        setActiveRaceData(newRaceData)
    }
    const saveRaceType = (newValue: any) => {
        let newRaceData: RaceDataType = activeRaceData
        newRaceData["Type"] = newValue.value
        setActiveRaceData(newRaceData)
    }

    const saveRaceDate = (e: ChangeEvent<HTMLInputElement>) => {
        let newRaceData: RaceDataType = activeRaceData
        var time = e.target.value
        time = time.replace('T', ' ')
        var day = dayjs(time)
        if (day.isValid()) {
            newRaceData[e.target.id] = time
            setActiveRaceData(newRaceData)
        } else {
            console.log("date is not valid input")
        }
    }

    const saveSeriesSettings = (e: ChangeEvent<HTMLInputElement>) => {
        let newSeriesData: SeriesDataType = activeSeriesData
        console.log(newSeriesData)
        newSeriesData.settings[e.target.id] = parseInt(e.target.value)
        setActiveSeriesData(newSeriesData)
    }

    const addRaceToSeries = async () => {
        //This doesn't seem to work for some reason, state updates before the confusing line, but doesn't change if that line is commented out.
        var race: RaceDataType = await DB.createRace(club, activeSeriesData.name)
        var newSeriesData: SeriesDataType[] = seriesData.map(obj => ({ ...obj }))
        newSeriesData[newSeriesData.findIndex(x => x.id === race.seriesId)]?.races.push(race)
        setSeriesData(newSeriesData)
    }
    const removeRace = async (raceId: string) => {
        console.log("updating main copy of series")
        let newSeriesData: SeriesDataType[] = seriesData
        var seriesIndex = newSeriesData.findIndex(y => y.id == activeSeriesData.id)
        var thisSeries = newSeriesData[seriesIndex]
        if (thisSeries == undefined) return
        let raceIndex = thisSeries.races.findIndex(x => x.id === raceId)
        console.log(raceIndex)
        newSeriesData[seriesIndex]?.races.splice(raceIndex, 1)
        console.log(newSeriesData)
        setSeriesData(newSeriesData)
        setUpdateState(updateState + 1) //this forces the component to update
    }
    useEffect(() => {
        if (club !== undefined) {

            const fetchRaces = async () => {
                var data = await DB.fetchSeries(club)
                var array = [...data]
                setSeriesData(array)
            }
            fetchRaces()

            const fetchBoats = async () => {
                var data = await DB.fetchBoats()
                if (data) {
                    var array = [...data]
                    console.log(array)
                    setBoatData(array)
                } else {
                    console.log("could not find boats")
                }
                
            }
            fetchBoats()
        }
    }, [club])

    useEffect(() => {
        generateBar()
    }, [seriesData, updateState]);

    useEffect(() => {
        setUpdateState(updateState + 1)
    }, [seriesData, activeRaceData.id, activeSeriesData]);

    return (
        <Dashboard>
            <div className="w-full flex flex-row items-center justify-start h-full">
                <div id="leftBar" className='flex basis-3/12 flex-col justify-start h-full border-pink-500 border-r-2'>
                    <div className='w-full flex cursor-pointer' onClick={showSettings}>
                        <div className='w-full p-4 bg-pink-500 text-lg font-extrabold text-gray-700'>
                            <p>Overview</p>
                        </div>
                    </div>
                </div>
                <div id="page" className='flex basis-9/12 h-full w-full'>
                    <div id="settings" className="">
                        <p className="text-6xl font-extrabold text-gray-700 p-6">
                            Overview
                        </p>
                        <p className='text-2xl font-bold text-gray-700 p-6'>
                                Series
                        </p>
                        <div className='p-6'>
                            <ClubTable data={seriesData} key={updateState} />
                        </div>
                        <p className='text-2xl font-bold text-gray-700 p-6'>
                                Boats
                        </p>
                        <div className='p-6'>
                            <BoatTable data={boatData} key={updateState} />
                        </div>


                    </div>
                    <div id="series" className="hidden w-full">
                        <p className="text-6xl font-extrabold text-gray-700 p-6">
                            {activeSeriesData.name}
                        </p>
                        <div className='p-6'>
                            <SeriesTable data={activeSeriesData.races} key={updateState} removeRace={removeRace} />
                        </div>
                        <div className="p-6">
                            <p onClick={addRaceToSeries} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0">
                                Add Race
                            </p>
                        </div>
                        <div className='flex flex-col px-6 w-full '>
                            <p className='text-2xl font-bold text-gray-700'>
                                Races To Count
                            </p>
                            <input type="text"
                                id='numberToCount'
                                className="w-full p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none"
                                defaultValue={activeSeriesData.settings.numberToCount}
                                key={activeSeriesData.id}
                                onChange={saveSeriesSettings}
                                onBlur={() => DB.updateSeriesSettings(activeSeriesData)}
                            />
                        </div>
                    </div>
                    <div id="race" className="hidden">
                        <p className="text-6xl font-extrabold text-gray-700 p-6">
                            {activeSeriesData.name}: {activeRaceData.number}
                        </p>
                        <div className="flex w-3/4">
                            <div className='flex flex-col px-6 w-full '>
                                <p className='text-2xl font-bold text-gray-700'>
                                    OOD
                                </p>
                                <input type="text"
                                    id='OOD'
                                    className="w-full p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none"
                                    defaultValue={activeRaceData.OOD}
                                    key={activeRaceData.id}
                                    onChange={saveRaceSettings}
                                    onBlur={() => DB.updateRaceSettings(activeRaceData)}
                                />
                            </div>

                            <div className='flex flex-col px-6 w-full'>
                                <p className='text-2xl font-bold text-gray-700'>
                                    AOD
                                </p>
                                <input type="text"
                                    id='AOD'
                                    className="w-full p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none"
                                    defaultValue={activeRaceData.AOD}
                                    key={activeRaceData.id}
                                    onChange={saveRaceSettings}
                                    onBlur={() => DB.updateRaceSettings(activeRaceData)}
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
                                    onBlur={() => DB.updateRaceSettings(activeRaceData)}
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
                                    onBlur={() => DB.updateRaceSettings(activeRaceData)}
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
                                    onBlur={() => DB.updateRaceSettings(activeRaceData)}
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
                                        onBlur={() => DB.updateRaceSettings(activeRaceData)}
                                        onChange={saveRaceType}
                                        instanceId={useId()}
                                        className='w-full'
                                        options={raceOptions} />
                                </div>
                            </div>
                        </div>
                        <div className='p-6 w-3/4'>
                            <RaceResultsTable data={activeRaceData} key={seriesData} />
                        </div>
                        <div className="p-6 w-3/4">
                            <p onClick={(e) => addRaceEntry(activeRaceData.id)} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0">
                                Add Entry
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Dashboard>
    )
}

export default Club