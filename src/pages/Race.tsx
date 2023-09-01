import React, { ChangeEvent, useEffect, useState } from "react"
import Router, { useRouter } from "next/router"
import * as DB from '../components/apiMethods';
import Dashboard from "../components/Dashboard";
import RaceTimer from "../components/RaceTimer"

enum raceStateType {
    running,
    stopped,
    reset
}

const RacePage = () => {

    const router = useRouter()

    const raceLength = 300500 //bit longer than 5 mins so that it shows as 5 mins and closer sync with clock

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
            Time: "",
            CorrectedTime: 0,
            Laps: 0,
            Position: 0,
        }],
        Type: "",
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
        Time: "",
        CorrectedTime: 0,
        Laps: 0,
        Position: 0,
    });

    var [raceState, setRaceActive] = useState<raceStateType>(raceStateType.reset)
    const [timerActive, setTimerActive] = useState(false);
    const [resetTimer, setResetTimer] = useState(false);
    const [startTime, setStartTime] = useState(0);

    const startRace = async () => {
        fetch("http://192.168.1.223/start", { mode: 'no-cors' }).then((res) => {
            if (res.status !== 0) {
                console.log("clock start failed with " + res.status)
                return
            }
            //set official start time in DB
            setStartTime(new Date().getTime() + raceLength)
            setResetTimer(false)
            setRaceActive(raceStateType.running)
            setInstructions("do the flags and the hooter!")
            //start countdown timer
            setTimerActive(true)

        }

        ).catch(function (err) {
            console.log('Fetch Error :-S', err);
            alert("race clock not connected.")
        });
    }

    const handleFourMinutes = () => {
        console.log('4 minutes left');
    };

    const handleOneMinute = () => {
        console.log('1 minute left');
    };

    const handleGo = () => {
        console.log('GO!');
    };

    const stopRace = async () => {
        //add are you sure here
        fetch("http://192.168.1.223/stop", { mode: 'no-cors' }).then((res) => {
            if (res.status !== 0) {
                console.log("clock stop failed with " + res.status)
                return
            }
            setRaceActive(raceStateType.stopped)
            setTimerActive(false)
            setInstructions("Hit reset to start from the beginning")
        }

        ).catch(function (err) {
            console.log('Fetch Error :-S', err);
            alert("race clock not connected.")
        });
    }

    const resetRace = async () => {
        //add are you sure here
        fetch("http://192.168.1.223/reset", { mode: 'no-cors' }).then((res) => {
            if (res.status !== 0) {
                console.log("clock reset failed with " + res.status)
                return
            }
            setRaceActive(raceStateType.reset)
            setStartTime(new Date().getTime() + raceLength)
            setResetTimer(true)
            setInstructions("Hit Start to begin the starting procedure")
        }

        ).catch(function (err) {
            console.log('Fetch Error :-S', err);
            alert("race clock not connected.")
        });
    }

    const openBoatMenu = async (e: any) => {
        //show modal
        let modal = document.getElementById("modal")
        if (!modal) return
        modal.style.display = "block"
        //option to lap, option to finish
        if (!e.target.parentNode) return
        setActiveResult(race.results[e.target.parentNode.id])

    }

    const closeBoatMenu = async () => {
        let modal = document.getElementById("modal")
        if (!modal) return
        modal.style.display = "none"

    }

    const lapBoat = async () => {
        //modify race data
        const tempdata = race
        tempdata.results[tempdata.findIndex((x: BoatDataType) => x.id === activeResult.id)].laps.push(new Date().getTime())
        setRace({ ...tempdata })
        //send to DB
        await DB.updateRaceById(tempdata)
        closeBoatMenu()
    }

    const finishBoat = async () => {
        //modify race data
        //send to DB
        closeBoatMenu()
    }

    useEffect(() => {
        let raceId = query.race as string
        const fetchRace = async () => {
            let data = await DB.getRaceById(raceId)
            setRace(data.race)
            fetch("http://192.168.1.223/reset", { mode: 'no-cors' })
            setSeriesName(await DB.GetSeriesById(data.race.seriesId).then((res) => { return (res.name) }))
        }
        if (raceId != undefined) {
            fetchRace()
        }
    }, [router])

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
                                    return (<p onClick={startRace} className="cursor-pointer text-white bg-green-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                        Start
                                    </p>)
                                case raceStateType.running:
                                    return (<p onClick={stopRace} className="cursor-pointer text-white bg-red-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                        Stop
                                    </p>)
                                case raceStateType.stopped:
                                    return (<p onClick={resetRace} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                        Reset
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
                            return (
                                <div key={index} id={index.toString()} onClick={openBoatMenu} className="duration-500 motion-safe:hover:scale-105 flex-col justify-center p-6 m-4 border-2 border-pink-500 rounded-lg shadow-xl cursor-pointer w-1/4 shrink-0">
                                    <h2 className="text-2xl text-gray-700">{element.SailNumber} - {element.boat.name}</h2>
                                    <p className="text-base text-gray-600">{element.Helm} - {element.Crew}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </Dashboard>
    )
}

export default RacePage