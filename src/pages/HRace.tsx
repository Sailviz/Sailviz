import React, { ChangeEvent, MouseEventHandler, useEffect, useState } from "react"
import Router, { useRouter } from "next/router"
import * as DB from '../components/apiMethods';
import Dashboard from "../components/Dashboard";
import RaceTimer from "../components/RaceTimer"
import Cookies from "js-cookie";

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
    var [clubId, setClubId] = useState<string>("invalid")
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
            finishTime: 0,
            CorrectedTime: 0,
            lapTimes: {
                times: [],
                number: 0
            },
            Position: 0,
        }],
        Type: "",
        startTime: 0,
        seriesId: ""
        //extra fields required for actually racing.
        //start time - UTC of start of 5 min count down.
    }))

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

    const [activeResultIndex, setActiveResultIndex] = useState(0);

    var [raceState, setRaceState] = useState<raceStateType>(raceStateType.reset)
    const [timerActive, setTimerActive] = useState(false);
    const [resetTimer, setResetTimer] = useState(false);
    const [startTime, setStartTime] = useState(0);
    const [clockIP, setClockIP] = useState("");
    const [finishMode, setFinishMode] = useState(false)

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

    const orderResults = async (results: ResultsDataType[]) => {
        console.log(results)
        results.sort((a, b) => {
            //compare laps
            console.log(a.finishTime)
            if (a.finishTime == -1) { //retired boats to end of list
                return 1
            } else if (b.finishTime == -1) { //retired boats to end of list
                return -1
            } else if (a.lapTimes.number != b.lapTimes.number) {
                return (a.lapTimes.number - b.lapTimes.number)
            } else {
                return (a.boat?.py - b.boat?.py)
            }
        })

        results.forEach((res, index) => {
            const element = document.getElementById(res.id)
            if (element) {
                element.style.order = index.toString()
            }
        })
    }

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

    const retireBoat = async (id: string) => {
        //modify race data
        const tempdata = race
        let index = tempdata.results.findIndex((x: ResultsDataType) => x.id === id)
        tempdata.results[index].finishTime = -1 //finish time is a string so we can put in status
        setRace({ ...tempdata })
        //send to DB
        await DB.updateResult(tempdata.results[activeResultIndex])
    }

    const lapBoat = async (id: string) => {
        console.log(id)
        //modify race data
        const tempdata = race
        let index = tempdata.results.findIndex((x: ResultsDataType) => x.id === id)
        tempdata.results[index].lapTimes.times.push(Math.floor(new Date().getTime() / 1000))
        tempdata.results[index].lapTimes.number += 1 //increment number of laps
        console.log(tempdata.results[index])
        DB.updateResult(tempdata.results[index])
        setRace({ ...tempdata })
        orderResults(tempdata.results)
        //send to DB
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
            if (result.finishTime == -1) {
                result.CorrectedTime = 99999
            }
        });

        //calculate finish position

        const sortedResults = resultsData.sort((a, b) => a.CorrectedTime - b.CorrectedTime);
        sortedResults.forEach((result, index) => {
            result.Position = index + 1;
        });

        sortedResults.forEach(result => {
            DB.updateResult(result)
        })

        console.log(sortedResults)
        router.push("/Dashboard")
    }

    const finishBoat = async (id: string) => {
        //modify race data
        const tempdata = race
        let index = tempdata.results.findIndex((x: ResultsDataType) => x.id === id)
        //set finish time
        tempdata.results[index].finishTime = Math.floor(new Date().getTime() / 1000)
        //add final lap to lap info
        tempdata.results[index].lapTimes.times.push(Math.floor(new Date().getTime() / 1000))
        tempdata.results[index].lapTimes.number += 1 //increment number of laps
        //update local race copy
        setRace({ ...tempdata })
        //moved finished to bottom of screen
        orderResults(tempdata.results)
        //send to DB
        await DB.updateResult(tempdata.results[index])
        setInstructions(tempdata.results[index].name + "finished")

        if (checkAllFinished()) {
            //show popup to say race is finished.
            stopRace()
            setRaceState(raceStateType.calculate)

        }
    }

    const checkAllFinished = () => {
        let allFinished = true
        race.results.forEach(data => {
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
                DB.GetSeriesById(data.seriesId).then((data: SeriesDataType) => {
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
    }, [router, query.race])

    useEffect(() => {
        let raceId = query.race as string
        const fetchRace = async () => {
            let data = await DB.getRaceById(raceId)
            setRace(data)

            setSeriesName(await DB.GetSeriesById(data.seriesId).then((res) => { return (res.name) }))
        }

        if (raceId != undefined) {
            fetchRace()
        }

    }, [clockIP, query.race])

    useEffect(() => {
        if (checkAllFinished()) {
            setInstructions("race is finished, calculate the results")
            setRaceState(raceStateType.calculate)
        }
        else if (race.startTime != 0) {
            setRaceState(raceStateType.running)
            setStartTime(race.startTime)
            setResetTimer(false)
            setTimerActive(true)
        }
        orderResults(race.results)
    }, [race])

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
                } else {
                    console.log("could not fetch club settings")
                }

            }
            fetchUser()
        } else {
            console.log("user not signed in")
            router.push("/")
        }
    }, [clubId])

    return (
        <Dashboard club={club.name} userName={user.name}>
            <div className="w-full flex flex-col items-center justify-start panel-height">
                <div className="flex w-full flex-row justify-around">
                    <div className="w-1/4 p-2 m-2 border-4 rounded-lg bg-white text-lg font-medium">
                        Event: {seriesName} - {race.number}
                    </div>
                    <div className="w-1/4 p-2 m-2 border-4 rounded-lg bg-white text-lg font-medium">
                        Race Time: <RaceTimer startTime={startTime} endTime={null} timerActive={timerActive} onFourMinutes={handleFourMinutes} onOneMinute={handleOneMinute} onGo={handleGo} onEnd={null} reset={resetTimer} />
                    </div>
                    <div className="p-2 w-1/4">
                        {(() => {
                            switch (raceState) {
                                case raceStateType.reset:
                                    return (<p onClick={startRaceButton} className="cursor-pointer text-white bg-green-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                        Start
                                    </p>)
                                case raceStateType.running:
                                    return (<p onClick={(e) => { confirm("are you sure you want to stop the race?") ? stopRace() : null; }} className="cursor-pointer text-white bg-red-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                        Stop
                                    </p>)
                                case raceStateType.stopped:
                                    return (<p onClick={resetRace} className="cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                        Reset
                                    </p>)
                                case raceStateType.calculate:
                                    return (<p onClick={calculateResults} className="cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                        Calculate Results
                                    </p>)
                                default:
                                    return (<p></p>)
                            }
                        })()}
                    </div>
                </div>
                <div className="flex w-full shrink flex-row justify-around">
                    <div className="w-7/12 p-2 my-2 mx-4 border-4 rounded-lg bg-white text-lg font-medium">
                        {Instructions}
                    </div>
                    <div className="w-1/4 p-2">
                        {finishMode ?
                            <p onClick={() => setFinishMode(false)} className="cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                Lap Mode
                            </p> :
                            <p onClick={() => setFinishMode(true)} className="cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                Finish Mode
                            </p>
                        }
                    </div>
                </div>
                <div className="overflow-auto">
                    <div className="flex flex-row justify-around flex-wrap">
                        {race.results.map((result, index) => {
                            if (result.finishTime == 0) {
                                //no defined finish time so we assume they have not finished
                                return (
                                    <div key={index} id={result.id} className='flex bg-green-300 flex-row justify-between m-4 border-2 border-pink-500 rounded-lg shadow-xl w-96 shrink-0'>
                                        <div className="flex flex-col m-6">
                                            <h2 className="text-2xl text-gray-700">{result.SailNumber} - {result.boat?.name}</h2>
                                            <p className="text-base text-gray-600">{result.Helm} - {result.Crew}</p>
                                            <p className="text-base text-gray-600">Laps: {result.lapTimes.number}</p>
                                        </div>
                                        <div className="p-5 w-2/4">
                                            {finishMode && raceState == raceStateType.running ?
                                                <div>
                                                    <p onClick={(e) => { finishBoat(result.id) }} className="cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-sm p-5 text-center my-1">
                                                        Finish
                                                    </p>
                                                    <p onClick={(e) => { confirm("are you sure you retire " + result.SailNumber) ? retireBoat(result.id) : null; }} className="cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-sm p-5 text-center my-1">
                                                        Retire
                                                    </p>
                                                </div>
                                                :
                                                <></>
                                            }
                                            {!finishMode && raceState == raceStateType.running ?
                                                <p onClick={(e) => { lapBoat(result.id) }} className="cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-sm p-5 text-center">
                                                    Lap
                                                </p>
                                                : <></>
                                            }

                                        </div>
                                    </div>
                                )
                            } else {
                                let text = "Finished"
                                if (result.finishTime == -1) {
                                    text = "Retired"
                                }
                                return (
                                    <div key={index} id={result.id} className='flex bg-red-300 flex-row justify-between p-6 m-4 border-2 border-pink-500 rounded-lg shadow-xl w-96 shrink-0'>
                                        <div className="flex flex-col">
                                            <h2 className="text-2xl text-gray-700">{result.SailNumber} - {result.boat.name}</h2>
                                            <p className="text-base text-gray-600">{result.Helm} - {result.Crew}</p>
                                        </div>
                                        <div className="px-5 py-1">
                                            <p className="text-white bg-blue-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0">
                                                {text}
                                            </p>

                                        </div>
                                    </div>
                                )
                            }
                        })}
                    </div>
                </div>
            </div>
        </Dashboard >
    )
}

export default RacePage