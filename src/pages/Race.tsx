import React, { ChangeEvent, useEffect, useState } from "react"
import Router, { useRouter } from "next/router"
import * as DB from '../components/apiMethods';
import Dashboard from "../components/Dashboard";
import RaceTimer from "../components/RaceTimer"

enum raceStateType {
    running,
    stopped,
    reset,
    calculate
}

const RacePage = () => {

    const router = useRouter()

    const raceLength = 301 //5 mins in seconds plus a bit so that it shows 5:00

    const query = router.query

    var [seriesName, setSeriesName] = useState("")

    var [Instructions, setInstructions] = useState("Hit Start to begin the starting procedure")

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
            finishTime: "",
            CorrectedTime: 0,
            lapTimes: {
                times: []
            },
            Position: 0,
        }],
        Type: "",
        startTime: 0,
        seriesId: ""
        //extra fields required for actually racing.
        //start time - UTC of start of 5 min count down.
    }))

    const [activeResult, setActiveResult] = useState({
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
        finishTime: "",
        CorrectedTime: 0,
        lapTimes: {
            times: []
        },
        Position: 0,
    });

    var [raceState, setRaceState] = useState<raceStateType>(raceStateType.reset)
    const [timerActive, setTimerActive] = useState(false);
    const [resetTimer, setResetTimer] = useState(false);
    const [startTime, setStartTime] = useState(0);
    const [clockIP, setClockIP] = useState("");

    const startRaceButton = async () => {
        const timeoutId = setTimeout(() => controller.abort(), 2000)
        fetch("http://" + clockIP + "/start", { signal: controller.signal }).then(response => {
            //set official start time in DB
            startRace()

            clearTimeout(timeoutId)
        }).catch((err) => {
            console.log("clock not connected")
            confirm("Clock not connected, do you want to start the race?") ? startRace() : null;
        })
    }

    const startRace = async () => {
        let localTime = Math.floor((new Date().getTime() / 1000) + raceLength)
        setStartTime(localTime)
        setResetTimer(false)
        setRaceState(raceStateType.running)
        setInstructions("show class flag.")
        //start countdown timer
        setTimerActive(true)

        //Update database
        let newRaceData: RaceDataType = race
        newRaceData.startTime = localTime
        setRace(newRaceData)
        //send to DB
        DB.updateRaceById(newRaceData)
    }

    const handleFourMinutes = () => {
        console.log('4 minutes left')
        setInstructions("show preparatory and class flag")
    };

    const handleOneMinute = () => {
        console.log('1 minute left')
        setInstructions("show class flag")
    };

    const handleGo = () => {
        console.log('GO!')
        setInstructions("show no flags")

    };

    const stopRace = async () => {
        //add are you sure here
        setRaceState(raceStateType.stopped)
        setTimerActive(false)
        setInstructions("Hit reset to start from the beginning")
        const timeoutId = setTimeout(() => controller.abort(), 2000)
        fetch("http://" + clockIP + "/stop", { signal: controller.signal }).then(response => {
            clearTimeout(timeoutId)
        }).catch(function (err) {
            console.log('Clock not connected: ', err);
        });
    }

    const resetRace = async () => {
        //add are you sure here
        const timeoutId = setTimeout(() => controller.abort(), 2000)
        fetch("http://" + clockIP + "/reset", { signal: controller.signal }).then(response => {
            clearTimeout(timeoutId)
        }).catch(function (err) {
            console.log('Clock not connected: ', err);
        });

        setRaceState(raceStateType.reset)
        setStartTime((new Date().getTime() / 1000) + raceLength)
        setResetTimer(true)
        setInstructions("Hit Start to begin the starting procedure")

    }

    const openBoatMenu = async (e: any) => {
        //show modal
        let modal = document.getElementById("modal")
        if (!modal) return
        modal.style.display = "block"
        //option to lap, option to finish
        if (!e.target.parentNode) return
        let index = race.results.findIndex((x: ResultsDataType) => x.id === e.target.parentNode.id)
        if (index >= 0) {
            setActiveResult(race.results[index])
        }

    }

    const closeBoatMenu = async () => {
        let modal = document.getElementById("modal")
        if (!modal) return
        modal.style.display = "none"

    }

    const lapBoat = async () => {
        //modify race data
        const tempdata = race
        let index = tempdata.results.findIndex((x: ResultsDataType) => x.id === activeResult.id)
        tempdata.results[index].lapTimes.times.push(Math.floor(new Date().getTime() / 1000))
        tempdata.results[index].lapTimes.number += 1 //increment number of laps
        console.log(tempdata.results[index])
        setRace({ ...tempdata })
        //send to DB
        await DB.updateResultById(tempdata.results[index])
        closeBoatMenu()
    }

    const calculateResults = () => {
        //most nuber of laps.
        console.log(race)
        const maxLaps = Math.max.apply(null, race.results.map(function (o: ResultsDataType) { return Object.keys(o.lapTimes).length }))
        console.log(maxLaps)
        if (!(maxLaps >= 0)) {
            console.log("max laps not more than one")
            return
        }
        const resultsData = [...race.results]

        //calculate corrected time
        resultsData.forEach(result => {
            let seconds = result.finishTime - race.startTime
            console.log(seconds)
            result.CorrectedTime = (seconds * 1000 * (maxLaps / Object.keys(result.lapTimes).length)) / result.boat.py
            console.log(result.CorrectedTime)
        });

        //calculate finish position

        const sortedResults = resultsData.sort((a, b) => a.CorrectedTime - b.CorrectedTime);
        sortedResults.forEach((result, index) => {
            result.Position = index + 1;
        });

        sortedResults.forEach(result => {
            DB.updateResultById(result)
        })

        console.log(sortedResults)
    }

    const finishBoat = async () => {
        //modify race data
        const tempdata = race
        let index = tempdata.results.findIndex((x: ResultsDataType) => x.id === activeResult.id)
        tempdata.results[index].finishTime = Math.floor(new Date().getTime() / 1000)
        console.log(tempdata.results[index])
        setRace({ ...tempdata })
        //send to DB
        await DB.updateResultById(tempdata.results[index])
        closeBoatMenu()

        let card = document.getElementById(activeResult.id)
        card?.classList.remove("bg-green-300")
        card?.classList.add("bg-red-300")
        card?.classList.add("active:pointer-events-none")

        if (checkAllFinished()) {
            //show popup to say race is finished.
            stopRace()
            setRaceState(raceStateType.calculate)

        }
    }

    const checkAllFinished = () => {
        let allFinished = true
        race.results.forEach(data => {
            console.log(data)
            if (data.finishTime == 0) {
                allFinished = false
            }
        })
        return allFinished
    }

    const controller = new AbortController()

    useEffect(() => {
        let raceId = query.race as string
        const getClockIP = async () => {
            await DB.getRaceById(raceId).then((data: RaceDataType) => {
                DB.GetSeriesById(data.race.seriesId).then((data: SeriesDataType) => {
                    console.log(data)
                    DB.GetClubById(data.clubId).then((data) => {
                        setClockIP(data.settings['clockIP'])
                    })
                })

            })
        }

        if (raceId != undefined) {
            getClockIP()

        }
    }, [router])

    useEffect(() => {
        let raceId = query.race as string
        const fetchRace = async () => {
            let data = await DB.getRaceById(raceId)
            setRace(data.race)

            setSeriesName(await DB.GetSeriesById(data.race.seriesId).then((res) => { return (res.name) }))
        }

        if (raceId != undefined) {
            fetchRace()
        }

    }, [clockIP])

    useEffect(() => {
        if (checkAllFinished()) {
            setRaceState(raceStateType.calculate)
        }
        else if (race.startTime != 0) {
            setRaceState(raceStateType.running)
            setStartTime(race.startTime)
            setResetTimer(false)
            setTimerActive(true)
        }
    }, [race])

    return (
        <Dashboard>
            <div className="w-full flex flex-col items-center justify-start panel-height">
                <div id="modal" className="hidden fixed z-10 left-0 top-0 w-full h-full overflow-auto bg-black-400">
                    <div className="bg-white bg-opacity-20 backdrop-blur rounded drop-shadow-lg border-pink-500 my-52 mx-auto p-5 border-4 w-7/12 h-3/6">
                        <p onClick={closeBoatMenu} className=" cursor-pointer bg-red-100 border-red-600 rounded-lg border-4 aspect-square float-right font-bold text-3xl w-12 text-center">&times;</p>
                        <h2 className="text-2xl text-gray-700">{activeResult.SailNumber} - {activeResult.boat.name}</h2>
                        <p className="text-base text-gray-600">{activeResult.Helm} - {activeResult.Crew}</p>

                        <div className="flex flex-row m-12 h-4/6">
                            <div className="px-5 py-1 w-3/4">
                                <p onClick={lapBoat} className="h-full cursor-pointer  text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-3xl px-5 py-2.5 text-center mr-3 md:mr-0">
                                    Lap
                                </p>
                            </div>
                            <div className="px-5 py-1 w-3/4">
                                <p onClick={finishBoat} className="h-full cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-3xl px-5 py-2.5 text-center mr-3 md:mr-0">
                                    Finish
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
                <div className="flex w-full shrink flex-row justify-around">
                    <div className="shrink w-1/4 p-2 m-2 border-4 rounded-lg bg-white text-lg font-medium">
                        Event: {seriesName} - {race.number}
                    </div>
                    <div className="shrink w-1/4 p-2 m-2 border-4 rounded-lg bg-white text-lg font-medium">
                        Race Time: <RaceTimer startTime={startTime} timerActive={timerActive} onFourMinutes={handleFourMinutes} onOneMinute={handleOneMinute} onGo={handleGo} reset={resetTimer} />
                    </div>
                    <div className="p-2 w-1/4">
                        {(() => {
                            switch (raceState) {
                                case raceStateType.reset:
                                    return (<p onClick={startRaceButton} className="cursor-pointer text-white bg-green-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                        Start
                                    </p>)
                                case raceStateType.running:
                                    return (<p onClick={(e) => { confirm("are you sure you want to stop the race?") ? stopRace() : null; }} className="cursor-pointer text-white bg-red-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                        Stop
                                    </p>)
                                case raceStateType.stopped:
                                    return (<p onClick={resetRace} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                        Reset
                                    </p>)
                                case raceStateType.calculate:
                                    return (<p onClick={calculateResults} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                        Calculate Results
                                    </p>)
                                default:
                                    return (<p></p>)
                            }
                        })()}
                    </div>
                </div>
                <div className="flex w-11/12 shrink flex-row justify-around">
                    <div className="shrink w-full p-2 m-2 border-4 rounded-lg bg-white text-lg font-medium">
                        {Instructions}
                    </div>
                </div>
                <div className=" w-full h-full grow">
                    <div className="flex flex-row justify-around flex-wrap">
                        {race.results.map((element, index) => {
                            if (element.finishTime != 0) {
                                return (
                                    <div key={index} id={element.id} onClick={openBoatMenu} className=' active:pointer-events-none bg-red-300 duration-500 motion-safe:hover:scale-105 flex-col justify-center p-6 m-4 border-2 border-pink-500 rounded-lg shadow-xl cursor-pointer w-1/4 shrink-0'>
                                        <h2 className="text-2xl text-gray-700">{element.SailNumber} - {element.boat.name}</h2>
                                        <p className="text-base text-gray-600">{element.Helm} - {element.Crew}</p>
                                    </div>
                                )
                            } else {
                                return (
                                    <div key={index} id={element.id} onClick={openBoatMenu} className='bg-green-300 duration-500 motion-safe:hover:scale-105 flex-col justify-center p-6 m-4 border-2 border-pink-500 rounded-lg shadow-xl cursor-pointer w-1/4 shrink-0'>
                                        <h2 className="text-2xl text-gray-700">{element.SailNumber} - {element.boat.name}</h2>
                                        <p className="text-base text-gray-600">{element.Helm} - {element.Crew}</p>
                                    </div>
                                )
                            }
                        })}
                    </div>
                </div>
            </div>
        </Dashboard>
    )
}

export default RacePage