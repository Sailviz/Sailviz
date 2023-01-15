import { useRouter } from 'next/router'
import { ChangeEvent, useEffect, useState, useId } from 'react';
import Dashboard from '../../components/Dashboard'
import Select from 'react-select';
import { server } from '../../components/URL';
import dayjs from 'dayjs';
import SeriesTable from '../../components/SeriesTable';

type RaceDataType = {
    [key: string]: any,
    id: string,
    number: number,
    dateTime: string,
    OOD: string,
    AOD: string,
    SO: string,
    ASO: string,
    results: any,
    Time: string,
    Type: string,
    seriesId: string
};

type SeriesDataType = {
    id: string,
    name: string,
    clubId: string,
    settings: object,
    races: RaceDataType[]
}

const raceOptions = [{ value: "Pursuit", label: "Pursuit" }, { value: "Handicap", label: "Handicap" }]

const Club = () => {
    const router = useRouter()
    var club = router.query.club

    var [activeSeriesData, setActiveSeriesData] = useState<SeriesDataType>({
        "id": "",
        "name": "",
        "clubId": "",
        "settings": {},
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
        "results": null,
        "Time": "",
        "Type": "",
        "seriesId": ""
    }))

    var [seriesData, setSeriesData] = useState<SeriesDataType[]>([])

    const getListOfSeries = async () => {
        const body = {
            "club": club
        }
        const res = await fetch(`${server}/api/GetSeriesByClub`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data && data.error) {
                    console.log(data.error)
                } else {
                    setSeriesData(data.series)
                }
            });
    };

    useEffect(() => {
        console.log('state changed', seriesData)
        generateBar()
    }, [seriesData]);


    const updateRaceSettings = async () => {
        const body = activeRaceData
        const res = await fetch(`${server}/api/UpdateRaceById`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data && data.error) {
                    console.log(data.error)
                } else {
                    console.log(data)
                }
            });
    };

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
            if (data == undefined) { return }
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
            console.log("here")
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

    useEffect(() => {
        if (club !== undefined) {
            const fetchRaces = async () => {
                await getListOfSeries()
            }
            fetchRaces()

            //now I need to transfer this data into the page


        }
    }, [club])

    return (
        <Dashboard>
            <div className="w-full flex flex-row items-center justify-start h-full">
                <div id="leftBar" className='flex basis-3/12 flex-col justify-start h-full border-pink-500 border-r-2'>
                    <div className='w-full flex cursor-pointer' onClick={showSettings}>
                        <div className='w-full p-4 bg-pink-500 text-lg font-extrabold text-gray-700'>
                            <p>Club Settings</p>
                        </div>
                    </div>
                </div>
                <div id="page" className='flex basis-9/12 h-full w-full'>
                    <div id="settings" className="">
                        <p className="text-6xl font-extrabold text-gray-700 p-6">
                            Settings
                        </p>
                        <div className="flex px-6">
                            <div className='flex flex-col px-6 w-full '>
                                <p className='text-2xl font-bold text-gray-700'>
                                    Series
                                </p>
                                <input type="text"
                                    id=''
                                    className="w-full p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none"
                                    defaultValue={activeSeriesData.name}
                                />
                                <SeriesTable data={seriesData} key={seriesData.length} />
                            </div>
                        </div>

                    </div>
                    <div id="series" className="hidden">
                        <p className="text-6xl font-extrabold text-gray-700 p-6">
                            {activeSeriesData.name}
                        </p>
                    </div>
                    <div id="race" className="hidden">
                        <p className="text-6xl font-extrabold text-gray-700 p-6">
                            {activeSeriesData.name}: {activeRaceData.number}
                        </p>
                        <div className="flex px-6">
                            <div className='flex flex-col px-6 w-full '>
                                <p className='text-2xl font-bold text-gray-700'>
                                    OOD
                                </p>
                                <input type="text"
                                    id='OOD'
                                    className="w-full p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none"
                                    defaultValue={activeRaceData.OOD}
                                    onChange={saveRaceSettings}
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
                                    onChange={saveRaceSettings}
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
                                    onChange={saveRaceDate}
                                />
                            </div>

                        </div>
                        <div className="flex px-6">
                            <div className='flex flex-col px-6 w-full'>
                                <p className='text-2xl font-bold text-gray-700'>
                                    SO
                                </p>
                                <input type="text"
                                    id='SO'
                                    className="w-full p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none"
                                    defaultValue={activeRaceData.SO}
                                    onChange={saveRaceSettings}
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
                                    onChange={saveRaceSettings}
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
                        <div className="p-6">
                            <p onClick={updateRaceSettings} className="text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0">
                                Save
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Dashboard>
    )
}

export default Club