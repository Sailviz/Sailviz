import React, { ChangeEvent, MouseEventHandler, useEffect, useState } from "react"
import Router, { useRouter } from "next/router"
import * as DB from '../components/apiMethods';
import Dashboard from "../components/Dashboard";
import RaceTimer from "../components/HRaceTimer"
import Cookies from "js-cookie";

enum raceStateType {
    running,
    stopped,
    reset,
    calculate
}

enum modeType {
    Retire,
    Lap,
    Finish
}

const resultCodes = [
    { 'desc': 'Did Not Finish', 'code': 'DNF' },
    { 'desc': 'Did Not Start', 'code': 'DNS' },
    { 'desc': 'Disqualified', 'code': 'DSQ' },
    { 'desc': 'On Course Side', 'code': 'OCS' },
    { 'desc': 'Not Sailed Course', 'code': 'NSC' }]

const RacePage = () => {

    const router = useRouter()

    const startLength = 315 //5 15secs in seconds

    const query = router.query

    var [seriesName, setSeriesName] = useState("")
    var [clubId, setClubId] = useState<string>("invalid")

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
                pursuitStartTime: 0
            } as BoatDataType,
            SailNumber: "",
            finishTime: 0,
            CorrectedTime: 0,
            laps: [{
                id: "",
                time: 0,
            } as LapDataType],
            PursuitPosition: 0,
        } as ResultsDataType],
        Type: "",
        seriesId: "",
        series: {} as SeriesDataType
    }))

    var [fleets, setFleets] = useState<FleetDataType[]>([{
        id: "",
        name: "",
        startTime: 0,
        seriesId: "",
        startDelay: 0,
        boats: [],

    }])

    var [lastResult, setLastResult] = useState<ResultsDataType | null>(null)

    var [club, setClub] = useState<ClubDataType>({
        id: "",
        name: "",
        settings: {
            clockIP: "",
            hornIP: "",
            pursuitLength: 0,
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

    const [raceState, setRaceState] = useState<raceStateType[]>([])
    const [activeResult, setActiveResult] = useState<ResultsDataType>({

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
            pursuitStartTime: 0
        },
        SailNumber: "",
        finishTime: 0,
        CorrectedTime: 0,
        laps: [{
            time: 0,
            id: "",
            resultId: ""
        }],
        PursuitPosition: 0,
        resultCode: "",
        fleetId: ""
    })

    const [mode, setMode] = useState(modeType.Lap)

    const startRaceButton = async (fleetId: string) => {
        //use time for button
        let localTime = Math.floor((new Date().getTime() / 1000) + startLength)
        //start the timer
        fetch("http://" + club.settings.clockIP + "/set?startTime=" + (localTime - club.settings.clockOffset).toString(), { signal: controller.signal, mode: 'no-cors' }).catch((err) => {
            console.log("clock not connected")
            console.log(err)
        })

        //Update database
        let fleet = fleets.find(fleet => fleet.id == fleetId)
        if (fleet == undefined) {
            console.error("fleet not found")
            return
        }
        fleet.startTime = localTime
        DB.updateFleetById(fleet)
        //send to DB
        startRace(fleetId)
    }

    const startRace = async (fleetId: string) => {
        let index = fleets.findIndex(fleet => fleet.id == fleetId)
        //modify racestate at index to match fleet index
        setRaceState([...raceState.slice(0, index), raceStateType.running, ...raceState.slice(index + 1)])

        let sound = document.getElementById("Beep") as HTMLAudioElement
        sound!.currentTime = 0
        sound!.play();
    }

    const handleWarning = () => {
        console.log('Warning')

        let sound = document.getElementById("Countdown") as HTMLAudioElement
        sound!.currentTime = 0
        sound!.play();
    }

    const handleFiveMinutes = () => {
        console.log('5 minutes left')

        //sound horn
        fetch("http://" + club.settings.hornIP + "/medium", { signal: controller.signal, mode: 'no-cors' }).then(response => {
        }).catch((err) => {
            console.log("horn not connected")
            console.log(err)
        })

        let sound = document.getElementById("Beep") as HTMLAudioElement
        sound!.currentTime = 0
        sound!.play();
    };

    const handleFourMinutes = () => {
        console.log('4 minutes left')

        //sound horn
        fetch("http://" + club.settings.hornIP + "/medium", { signal: controller.signal, mode: 'no-cors' }).then(response => {
        }).catch((err) => {
            console.log("horn not connected")
            console.log(err)
        })

        let sound = document.getElementById("Beep") as HTMLAudioElement
        sound!.currentTime = 0
        sound!.play();
    };

    const handleOneMinute = () => {
        console.log('1 minute left')

        //sound horn
        fetch("http://" + club.settings.hornIP + "/long", { signal: controller.signal, mode: 'no-cors' }).then(response => {
        }).catch((err) => {
            console.log("horn not connected")
            console.log(err)
        })

        let sound = document.getElementById("Beep") as HTMLAudioElement
        sound!.currentTime = 0
        sound!.play();
    };

    const handleGo = () => {
        console.log('GO!')

        //sound horn
        fetch("http://" + club.settings.hornIP + "/medium", { signal: controller.signal, mode: 'no-cors' }).then(response => {
        }).catch((err) => {
            console.log("horn not connected")
            console.log(err)
        })

        let sound = document.getElementById("Beep") as HTMLAudioElement
        sound!.currentTime = 0
        sound!.play();
    };

    const orderResults = async (results: ResultsDataType[]) => {
        results.sort((a, b) => {
            //if done a lap, predicted is sum of lap times + last lap.
            //if no lap done, predicted is py.
            let aPredicted = a.laps.length > 0 ? a.laps.reduce((sum: number, lap: LapDataType) => sum + lap.time, a.laps[a.laps.length - 1]!.time) : a.boat.py / 10
            let bPredicted = b.laps.length > 0 ? b.laps.reduce((sum: number, lap: LapDataType) => sum + lap.time, b.laps[b.laps.length - 1]!.time) : b.boat.py / 10

            return aPredicted - bPredicted;
        });

        results.forEach((res, index) => {
            const element = document.getElementById(res.id)
            if (element) {
                element.style.order = index.toString()
            }
        })
    }

    const stopRace = async (fleetId: string) => {
        let index = fleets.findIndex(fleet => fleet.id == fleetId)
        //modify racestate at index to match fleet index
        setRaceState([...raceState.slice(0, index), raceStateType.stopped, ...raceState.slice(index + 1)])
        fetch("http://" + club.settings.clockIP + "/reset", { signal: controller.signal, mode: 'no-cors' }).catch(function (err) {
            console.log('Clock not connected: ', err);
        });
    }

    const resetRace = async (fleetId: string) => {
        let fleet = fleets.find(fleet => fleet.id == fleetId)
        if (fleet == undefined) {
            console.error("fleet not found")
            return
        }
        //add are you sure here
        fetch("http://" + club.settings.clockIP + "/reset", { signal: controller.signal, mode: 'no-cors' }).catch(function (err) {
            console.log('Clock not connected: ', err);
        });

        let index = fleets.findIndex(fleet => fleet.id == fleetId)
        //modify racestate at index to match fleet index
        setRaceState([...raceState.slice(0, index), raceStateType.reset, ...raceState.slice(index + 1)])

        //Update database
        fleet.startTime = 0
        await DB.updateFleetById(fleet)

        //remove race laps/times for racers.
        race.results.forEach(result => {
            result.lapTimes = {
                times: [],
                number: 0
            }
            result.finishTime = 0
            result.CorrectedTime = 0
            result.Position = 0

            DB.updateResult(result)
        })

    }

    const retireBoat = async (resultCode: string) => {
        let tempdata = activeResult
        tempdata.resultCode = resultCode
        await DB.updateResult(tempdata)

        let data = await DB.getRaceById(race.id)
        setRace(data)

        await hideRetireModal()

    }

    const lapBoat = async (id: string) => {
        let data = window.structuredClone(race)
        //modify race data
        let index = data.results.findIndex((x: ResultsDataType) => x.id === id)
        //save state for undo
        setLastResult({ ...data.results[index] })

        await DB.CreateLap(id, Math.floor(new Date().getTime() / 1000))
        let tempdata = window.structuredClone(race)
        orderResults(tempdata.results)
        //send to DB

        let sound = document.getElementById("Beep") as HTMLAudioElement
        sound!.currentTime = 0
        sound!.play();
    }

    const calculateResults = () => {
        // //most nuber of laps.
        // console.log(race)
        // const maxLaps = Math.max.apply(null, race.results.map(function (o: ResultsDataType) { return o.laps.length }))
        // console.log(maxLaps)
        // if (!(maxLaps >= 0)) {
        //     console.log("max laps not more than one")
        //     return
        // }
        // const resultsData = [...race.results]

        // //calculate corrected time
        // resultsData.forEach(result => {
        //     let seconds = result.finishTime - race.startTime
        //     console.log(seconds)
        //     result.CorrectedTime = (seconds * 1000 * (maxLaps / result.lapTimes.times.length)) / result.boat.py
        //     result.CorrectedTime = Math.round(result.CorrectedTime * 10) / 10
        //     console.log(result.CorrectedTime)
        //     if (result.finishTime == -1) {
        //         result.CorrectedTime = 99999
        //     }
        // });

        // //calculate finish position

        // const sortedResults = resultsData.sort((a, b) => a.CorrectedTime - b.CorrectedTime);
        // sortedResults.forEach((result, index) => {
        //     result.Position = index + 1;
        // });

        // sortedResults.forEach(result => {
        //     DB.updateResult(result)
        // })

        // console.log(sortedResults)
        router.push({ pathname: '/Race', query: { race: race.id } })
    }

    const finishBoat = async (id: string) => {
        //sound horn
        fetch("http://" + club.settings.hornIP + "/short", { signal: controller.signal, mode: 'no-cors' }).then(response => {
        }).catch((err) => {
            console.log("horn not connected")
            console.log(err)
        })

        const time = Math.floor(new Date().getTime() / 1000)
        await DB.CreateLap(id, time)

        //modify race data
        let data = window.structuredClone(race)
        let index = data.results.findIndex((x: ResultsDataType) => x.id === id)
        //save state for undo
        setLastResult({ ...data.results[index] })

        let tempdata = window.structuredClone(race)

        index = tempdata.results.findIndex((x: ResultsDataType) => x.id === id)
        console.log(tempdata.results[index])
        //set finish time
        tempdata.results[index].finishTime = time
        //send to DB
        await DB.updateResult(tempdata.results[index])
        //moved finished to bottom of screen
        orderResults(tempdata.results)

        if (checkAllFinished(tempdata.results[index].fleetId)) {
            //show popup to say race is finished.
            stopRace(tempdata.results[index].fleetId)
            let fleetindex = fleets.findIndex(fleet => fleet.id == tempdata.results[index].fleetId)
            setRaceState([...raceState.slice(0, fleetindex), raceStateType.running, ...raceState.slice(fleetindex + 1)])


        }
        let sound = document.getElementById("Beep") as HTMLAudioElement
        sound!.currentTime = 0
        sound!.play();
    }

    const checkAllFinished = (fleetId: string) => {
        //check if all boats in fleet have finished
        let results = race.results.filter(result => result.fleetId == fleetId)
        let allFinished = true
        results.forEach(data => {
            if (data.finishTime == 0) {
                allFinished = false
            }
        })
        return allFinished
    }

    const undo = async () => {
        if (lastResult == null) {
            return;
        }
        if (!confirm("are you sure you want to undo your last action?")) {
            return
        }
        //revert to last result
        const tempdata = race
        let index = tempdata.results.findIndex((x: ResultsDataType) => x.id === lastResult!.id)
        console.log(index)
        console.log(lastResult)
        tempdata.results[index] = lastResult
        //update local race copy
        setRace({ ...tempdata })
        //send to DB
        await DB.updateResult(lastResult)

        setLastResult(null)

    }

    const controller = new AbortController()


    useEffect(() => {
        let raceId = query.race as string
        const fetchRace = async () => {
            let data = await DB.getRaceById(raceId)
            setRace(data)

            setSeriesName(await DB.GetSeriesById(data.seriesId).then((res) => { return (res.name) }))
            const fleets = await DB.GetFleetsBySeries(data.seriesId)
            setFleets(fleets)
            setRaceState(fleets.map(() => raceStateType.reset))
        }

        if (raceId != undefined) {
            fetchRace()
        }

    }, [query.race])

    useEffect(() => {
        fleets.forEach((fleet, index) => {
            if (checkAllFinished(fleet.id)) {
                setRaceState([...raceState.slice(0, index), raceStateType.running, ...raceState.slice(index + 1)])
            }
            else if (fleet.startTime != 0) {
                setRaceState([...raceState.slice(0, index), raceStateType.running, ...raceState.slice(index + 1)])
            }
            orderResults(race.results)
        })
    }, [race])

    useEffect(() => {
        let RetireModeButton = document.getElementById("RetireModeButton")!.firstChild as HTMLElement
        let LapModeButton = document.getElementById("LapModeButton")!.firstChild as HTMLElement
        let FinishModeButton = document.getElementById("FinishModeButton")!.firstChild as HTMLElement

        switch (mode) {
            case modeType.Retire:
                RetireModeButton.classList.add("bg-green-600")
                LapModeButton.classList.remove("bg-green-600")
                FinishModeButton.classList.remove("bg-green-600")
                break
            case modeType.Lap:
                RetireModeButton.classList.remove("bg-green-600")
                LapModeButton.classList.add("bg-green-600")
                FinishModeButton.classList.remove("bg-green-600")
                break
            case modeType.Finish:
                RetireModeButton.classList.remove("bg-green-600")
                LapModeButton.classList.remove("bg-green-600")
                FinishModeButton.classList.add("bg-green-600")
                break
        }
    }, [mode])

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
                    console.log(data)
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

    const [time, setTime] = useState("");

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date().toTimeString().split(' ')[0]!), 1000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    const showRetireModal = (id: String) => {
        const modal = document.getElementById("retireModal")
        setActiveResult(race.results.find(result => result.id == id))
        modal?.classList.remove("hidden")


    }

    const hideRetireModal = () => {
        const modal = document.getElementById("retireModal")
        modal?.classList.add("hidden")

    }

    //const


    return (
        <Dashboard club={club.name} displayName={user.displayName}>
            <audio id="Beep" src=".\beep-6.mp3" ></audio>
            <audio id="Countdown" src=".\Countdown.mp3" ></audio>
            <div className="w-full flex flex-col items-center justify-start panel-height">
                <div className="flex w-full flex-col justify-around">
                    <div className="w-1/4 p-2">
                        <p onClick={() => router.back()} className="cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                            Back To Home
                        </p>
                    </div>
                    <div className="w-1/4 p-2 m-2 border-4 rounded-lg bg-white text-lg font-medium">
                        Actual Time:  {time}
                    </div>
                    {fleets.map((fleet, index) => {
                        return (
                            <div className="flex flex-row">
                                <div className="w-1/4 p-2 m-2 border-4 rounded-lg bg-white text-lg font-medium">
                                    Event: {seriesName} - {race.number} - {fleet.name} {index}
                                </div>
                                <div className="w-1/4 p-2 m-2 border-4 rounded-lg bg-white text-lg font-medium">
                                    Race Time: <RaceTimer key={"fleetTimer" + index} startTime={fleet.startTime} timerActive={raceState[index] == raceStateType.running} onFiveMinutes={handleFiveMinutes} onFourMinutes={handleFourMinutes} onOneMinute={handleOneMinute} onGo={handleGo} onWarning={handleWarning} reset={raceState[index] == raceStateType.reset} />
                                </div>
                                <div className="p-2 w-1/4" id="RaceStateButton">
                                    {(() => {
                                        switch (raceState[index]) {
                                            case raceStateType.reset:
                                                return (<p onClick={() => startRaceButton(fleet.id)} className="cursor-pointer text-white bg-green-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                                    Start
                                                </p>)
                                            case raceStateType.running:
                                                return (<p onClick={(e) => { confirm("are you sure you want to stop the race?") ? stopRace(fleet.id) : null; }} className="cursor-pointer text-white bg-red-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                                    Stop
                                                </p>)
                                            case raceStateType.stopped:
                                                return (<p onClick={() => resetRace(fleet.id)} className="cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                                    Reset
                                                </p>)
                                            case raceStateType.calculate:
                                                return (<p id="CalcResultsButton" onClick={calculateResults} className="cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                                    Calculate Results
                                                </p>)
                                            default:
                                                return (<p></p>)
                                        }
                                    })()}
                                </div>
                            </div>
                        )
                    })
                    }
                </div>
                <div className="flex w-full shrink flex-row justify-around">
                    <div className="w-1/4 p-2">
                        <p onClick={() => undo()} className="cursor-pointer text-white bg-red-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                            Undo
                        </p>
                    </div>
                    <div className="w-1/4 p-2" id="RetireModeButton">
                        <p onClick={() => setMode(modeType.Retire)} className="cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                            Retire Mode
                        </p>
                    </div>
                    <div className="w-1/4 p-2" id="LapModeButton">
                        <p onClick={() => setMode(modeType.Lap)} className="cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                            Lap Mode
                        </p>
                    </div>
                    <div className="w-1/4 p-2" id="FinishModeButton">
                        <p onClick={() => setMode(modeType.Finish)} className="cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                            Finish Mode
                        </p>
                    </div>
                </div>
                <div className="overflow-auto">
                    <div className="flex flex-row justify-around flex-wrap" id="EntrantCards">
                        {race.results.map((result, index) => {
                            if (result.resultCode != "") {
                                let text = result.resultCode
                                return (
                                    <div key={index} id={result.id} className='flex bg-red-300 flex-row justify-between p-6 m-4 border-2 border-pink-500 rounded-lg shadow-xl w-96 shrink-0'>
                                        <div className="flex flex-col">
                                            <h2 className="text-2xl text-gray-700">{result.SailNumber} - {result.boat.name}</h2>
                                            <p className="text-base text-gray-600">{result.Helm} - {result.Crew}</p>
                                            {/* <p className="text-base text-gray-600">Laps: {result.lapTimes.number} Finish: {new Date((result.finishTime - race.startTime) * 1000).toISOString().slice(14, 19)}</p> */}
                                        </div>
                                        <div className="px-5 py-1">
                                            <p className="text-2xl text-gray-700 px-5 py-2.5 text-center mr-3 md:mr-0">
                                                {text}
                                            </p>
                                        </div>
                                    </div>
                                )
                            }
                            if (result.finishTime == 0) {
                                //no defined finish time so we assume they have not finished
                                return (
                                    <div key={index} id={result.id} className='flex bg-green-300 flex-row justify-between m-4 border-2 border-pink-500 rounded-lg shadow-xl w-96 shrink-0'>
                                        <div className="flex flex-col ml-4 my-6">
                                            <h2 className="text-2xl text-gray-700">{result.SailNumber} - {result.boat?.name}</h2>
                                            <p className="text-base text-gray-600">{result.Helm} - {result.Crew}</p>
                                            {/* {result.lapTimes.times.length >= 1 ?
                                                // <p className="text-base text-gray-600">Laps: {result.lapTimes.number} Last: {new Date((result.lapTimes.times[result.lapTimes.times.length - 1] - race.startTime) * 1000).toISOString().slice(14, 19)}</p>
                                                <p>line above needs fixing</p>
                                                :
                                                <p className="text-base text-gray-600">Laps: {result.lapTimes.number} </p>
                                            } */}
                                        </div>
                                        <div className="px-5 py-2 w-2/4">
                                            {raceState.some((state) => state == raceStateType.running) ?
                                                <div>
                                                    {(() => {
                                                        switch (mode) {
                                                            case modeType.Finish:
                                                                return (
                                                                    <p onClick={(e) => { finishBoat(result.id) }} className="cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-sm p-5 text-center mb-5">
                                                                        Finish
                                                                    </p>

                                                                )
                                                            case modeType.Retire:
                                                                return (
                                                                    <p onClick={(e) => { showRetireModal(result.id) }} className="text-white bg-blue-600 font-medium rounded-lg text-sm p-5 text-center mt-5">
                                                                        Retire
                                                                    </p>
                                                                )
                                                            case modeType.Lap:
                                                                return (
                                                                    <p onClick={(e) => { lapBoat(result.id) }} className="text-white bg-blue-600 font-medium rounded-lg text-sm p-5 text-center mt-5">
                                                                        Lap
                                                                    </p>
                                                                )
                                                        }
                                                    })()}
                                                </div>
                                                :
                                                <></>
                                            }

                                        </div>
                                    </div>
                                )
                            } else {
                                let text = "Finished"
                                return (
                                    <div key={index} id={result.id} className='flex bg-red-300 flex-row justify-between p-6 m-4 border-2 border-pink-500 rounded-lg shadow-xl w-96 shrink-0'>
                                        <div className="flex flex-col">
                                            <h2 className="text-2xl text-gray-700">{result.SailNumber} - {result.boat.name}</h2>
                                            <p className="text-base text-gray-600">{result.Helm} - {result.Crew}</p>
                                            {/* <p className="text-base text-gray-600">Laps: {result.lapTimes.number} Finish: {new Date((result.finishTime - race.startTime) * 1000).toISOString().slice(14, 19)}</p> */}
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
            <div id="retireModal" className="hidden fixed z-10 left-0 top-0 w-full h-full overflow-auto bg-gray-400 backdrop-blur-sm bg-opacity-20">
                <div className="mx-auto my-20 px-a py-5 border w-1/4 bg-gray-300 rounded-sm">
                    <div className="text-6xl font-extrabold text-gray-700 flex justify-center">Retire Boat</div>
                    <span className="text-4xl font-extrabold text-gray-700 flex justify-center mb-8">{activeResult.Helm} - {activeResult.boat.name}:{activeResult.SailNumber}</span>
                    {resultCodes.map((resultCode) => {
                        return (
                            <div key={resultCode.code} className="flex mb-2 justify-center">
                                <div
                                    onClick={() => retireBoat(resultCode.code)}
                                    className="w-1/2 cursor-pointer text-white bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0"
                                >
                                    {resultCode.desc} ({resultCode.code})
                                </div>
                            </div>
                        )
                    })
                    }
                    <div className="flex mt-8 justify-center">
                        <p id="retireCancel" onClick={hideRetireModal} className="w-1/2 cursor-pointer text-white bg-red-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0">
                            Cancel
                        </p>
                    </div>
                </div>
            </div>
        </Dashboard >
    )
}

export default RacePage