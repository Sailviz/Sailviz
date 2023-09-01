import React, { useEffect, useState } from "react"
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

    const raceLength = 300000

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
            boat: {},
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

    var [raceState, setRaceActive] = useState<raceStateType>(raceStateType.reset)
    const [timerActive, setTimerActive] = useState(false);
    const [startTime, setStartTime] = useState(0);

    const startRace = async () => {
        fetch("http://192.168.1.223/start", { mode: 'no-cors' }).then((res) => {
            if (res.status !== 0) {
                console.log("clock start failed with " + res.status)
                return
            }
            //set official start time in DB
            setStartTime(new Date().getTime() + raceLength)
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
            setInstructions("Hit Start to begin the starting procedure")
        }

        ).catch(function (err) {
            console.log('Fetch Error :-S', err);
            alert("race clock not connected.")
        });
    }

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
    }, [router])

    return (
        <Dashboard>
            <div className="w-full flex flex-col items-center justify-start panel-height">
                <div className="flex w-full shrink flex-row justify-around">
                    <div className="shrink w-1/4 p-2 m-2 border-4 rounded-lg bg-white text-lg font-medium">
                        Event: {seriesName} - {race.number}
                    </div>
                    <div className="shrink w-1/4 p-2 m-2 border-4 rounded-lg bg-white text-lg font-medium">
                        Race Time: <RaceTimer startTime={startTime} timerActive={timerActive} onFourMinutes={handleFourMinutes} onOneMinute={handleOneMinute} onGo={handleGo} />
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
                                <div key={index} className="duration-500 motion-safe:hover:scale-105 flex-col justify-center p-6 m-4 border-2 border-pink-500 rounded-lg shadow-xl cursor-pointer w-1/4 shrink-0">
                                    <h2 className="text-2xl text-gray-700">{element.SailNumber} - {element.boat.name}</h2>
                                    <p className="text-base text-gray-600">{element.Helm}</p>
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