import React, { ChangeEvent, MouseEventHandler, useEffect, useState } from "react"
import Router, { useRouter } from "next/router"
import * as DB from '../../components/apiMethods';
import Dashboard from "../../components/ui/Dashboard";
import PursuitTimer from "../../components/PRaceTimer"
import Cookies from "js-cookie";
import { ReactSortable } from "react-sortablejs";
import * as Fetcher from '../../components/Fetchers';

enum raceStateType {
    running,
    stopped,
    reset,
    calculate
}

//pursuit races don't work with fleets, why would you?
//all fleets have same status.

const RacePage = () => {

    const router = useRouter()

    const startLength = 315 //5 mins 15 seconds in seconds

    const query = router.query

    var [seriesName, setSeriesName] = useState("")

    var [race, setRace] = useState<RaceDataType>(({
        id: "",
        number: 0,
        Time: "",
        OOD: "",
        AOD: "",
        SO: "",
        ASO: "",
        fleets: [{
            startTime: 0,
            id: "",
            results: [{
                id: "",
                fleetId: "",
                raceId: "",
                Helm: "",
                Crew: "",
                boat: {} as BoatDataType,
                SailNumber: "",
                finishTime: 0,
                laps: [],
                CorrectedTime: 0,
                PursuitPosition: 0,
                HandicapPosition: 0,
                resultCode: ""
            } as ResultsDataType],
        } as FleetDataType
        ],
        Type: "",
        seriesId: "",
        series: {} as SeriesDataType
    }))

    const { user, userIsError, userIsValidating } = Fetcher.UseUser()
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()

    var [raceState, setRaceState] = useState<raceStateType>(raceStateType.reset)

    const startRaceButton = async () => {
        let localTime = Math.floor((new Date().getTime() / 1000) + startLength)
        const timeoutId = setTimeout(() => controller.abort(), 2000)
        fetch("http://" + club.settings.hornIP + "/medium", { signal: controller.signal, mode: 'no-cors' }).then(response => {
        }).catch((err) => {
            console.log("horn not connected")
            console.log(err)
        })
        //start the timer
        fetch("http://" + club.settings.clockIP + "/set?startTime=" + (localTime - club.settings.clockOffset).toString(), { signal: controller.signal, mode: 'no-cors' }).then(response => {
            //configure race start

            clearTimeout(timeoutId)
        }).catch((err) => {
            console.log("clock not connected")
            console.log(err)
        })

        //Update database
        console.log("here")

        race.fleets.forEach(fleet => async () => {
            console.log("here")
            fleet.startTime = localTime
            await DB.updateFleetById(fleet)
        })
        startRace()
    }

    const startRace = async () => {
        setRaceState(raceStateType.running)
        //start countdown timer

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

    const stopRace = async () => {
        //add are you sure here
        setRaceState(raceStateType.stopped)
        const timeoutId = setTimeout(() => controller.abort(), 2000)
        fetch("http://" + club.settings.clockIP + "/reset", { signal: controller.signal, mode: 'no-cors' }).then(response => {
            clearTimeout(timeoutId)
        }).catch(function (err) {
            console.log('Clock not connected: ', err);
        });
    }

    const resetRace = async () => {
        //add are you sure here
        const timeoutId = setTimeout(() => controller.abort(), 2000)
        fetch("http://" + club.settings.clockIP + "/reset", { signal: controller.signal, mode: 'no-cors' }).then(response => {
            clearTimeout(timeoutId)
        }).catch(function (err) {
            console.log('Clock not connected: ', err);
        });
        //Update database
        race.fleets.forEach(fleet => {
            fleet.startTime = 0
            DB.updateFleetById(fleet)
        })

        setRaceState(raceStateType.reset)

    }

    const retireBoat = async (resultId: string) => {
        let result: ResultsDataType | undefined;
        race.fleets.some(fleet => {
            result = fleet.results.find(result => result.id === resultId);
            return result !== undefined;
        });
        if (result == undefined) {
            console.error("Could not find result with id: " + resultId);
            return
        }
        result.resultCode = "RET"
        await DB.updateResult(result)
        setRace(await DB.getRaceById(race.id))
        //send to DB
    }

    const lapBoat = async (id: string) => {
        //modify local race data

        await DB.CreateLap(id, Math.floor(new Date().getTime() / 1000))
        let updatedData = await DB.getRaceById(race.id)

        //recalculate position
        // there is just one fleet so grab the first one
        updatedData.fleets[0]!.results.sort((a: ResultsDataType, b: ResultsDataType) => {
            // get the number of laps for each boat
            if (a.resultCode != "") return 1
            if (b.resultCode != "") return -1
            console.log(b.laps.at(-1))
            let lapsA = a.laps.length;
            let lapsB = b.laps.length;
            // get the last lap time for each boat
            let lastA = a.laps.at(-1)?.time!;
            let lastB = b.laps.at(-1)?.time!;
            // compare the number of laps first, then the last lap time
            return lapsB - lapsA || lastA - lastB;
        });

        updatedData.fleets.flatMap(fleet => fleet.results).forEach((_, index) => {
            //there is only one fleet
            updatedData.fleets[0]!.results[index]!.PursuitPosition = index + 1
        })

        setRace({ ...updatedData })

        let sound = document.getElementById("Beep") as HTMLAudioElement
        sound!.currentTime = 0
        sound!.play();

    }

    const endRace = async () => {
        setRaceState(raceStateType.calculate)

        //sound horn
        fetch("http://" + club.settings.hornIP + "/medium", { signal: controller.signal, mode: 'no-cors' }).then(response => {
        }).catch((err) => {
            console.log("horn not connected")
            console.log(err)
        })
        let sound = document.getElementById("Beep") as HTMLAudioElement
        sound!.currentTime = 0
        sound!.play();
    }

    const submitResults = async () => {
        for (const result of race.fleets.flatMap(fleet => fleet.results)) {
            await DB.updateResult(result)
        }
        router.push({ pathname: '/Race', query: { race: race.id } })
    }

    const setOrder = async (updatedResults: ResultsDataType[]) => {
        if (updatedResults.length < 2) return
        console.log(updatedResults)

        for (let i = 0; i < updatedResults.length; i++) {
            updatedResults[i]!.PursuitPosition = i + 1
        }
        let tempResults = { ...race, results: updatedResults }
        setRace(tempResults)
        updatedResults.forEach(result => {
            DB.updateResult(result)
        })
    }

    const ontimeupdate = async (time: { minutes: number, seconds: number, countingUp: boolean }) => {
        let timeInSeconds = time.minutes * 60 + time.seconds

        let allStarted = true

        race.fleets.flatMap(fleet => fleet.results).forEach(result => {
            if ((result.boat?.pursuitStartTime || 0) < timeInSeconds && time.countingUp == true) {
                //boat has started

            } else {
                //boat has not stated
                allStarted = false
            }

        })

        //to catch race being finished on page load
        if (time.minutes > club.settings.pursuitLength && time.countingUp == true) {
            setRaceState(raceStateType.calculate)
        }

    }

    const controller = new AbortController()

    useEffect(() => {
        let raceId = query.race as string
        const fetchRace = async () => {
            let data = await DB.getRaceById(raceId)
            //sort race results by pursuit position
            console.log(data.fleets[0]?.startTime)
            if (data.fleets[0]?.startTime != 0) {
                const sortedResults = data.fleets[0]!.results.sort((a: ResultsDataType, b: ResultsDataType) => a.PursuitPosition - b.PursuitPosition);
                setRace({ ...data, fleets: [{ ...data.fleets[0] as FleetDataType, results: sortedResults }] })
                setRaceState(raceStateType.running)
                //check if race has already finished
                if (Math.floor((new Date().getTime() / 1000) - data.fleets[0]!.startTime) > (club.settings.pursuitLength * 60)) {
                    console.log(data.fleets[0]!.startTime)
                    setRaceState(raceStateType.calculate)
                }
            } else {
                const sortedResults = data.fleets[0]!.results.sort((a: ResultsDataType, b: ResultsDataType) => b.boat.py - a.boat.py);
                setRace({ ...data, fleets: [{ ...data.fleets[0] as FleetDataType, results: sortedResults }] })
            }

            setSeriesName(await DB.GetSeriesById(data.seriesId).then((res) => { return (res.name) }))
        }

        if (raceId != undefined) {
            fetchRace()
        }

    }, [router, club])

    const [time, setTime] = useState("");

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date().toTimeString().split(' ')[0]!), 1000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <Dashboard >

            <audio id="Beep" src=".\beep-6.mp3" ></audio>
            <audio id="Countdown" src=".\Countdown.mp3" ></audio>
            <div className="w-full flex flex-col items-center justify-start panel-height overflow-auto">
                <div className="flex w-full flex-row justify-around">
                    <div className="w-1/4 p-2 m-2 border-4 rounded-lg bg-white text-lg font-medium">
                        Event: {seriesName} - {race.number}
                    </div>
                    {
                        (race.fleets.length < 1) ?
                            <p>Waiting for boats to be added to fleets</p>
                            :
                            <div className="w-1/4 p-2 m-2 border-4 rounded-lg bg-white text-lg font-medium">
                                Race Time: <PursuitTimer startTime={race.fleets[0]!.startTime} endTime={club?.settings.pursuitLength} timerActive={raceState == raceStateType.running} onFiveMinutes={handleFiveMinutes} onFourMinutes={handleFourMinutes} onOneMinute={handleOneMinute} onGo={handleGo} onEnd={endRace} onTimeUpdate={ontimeupdate} onWarning={handleWarning} reset={raceState == raceStateType.reset} />
                            </div>
                    }
                    <div className="w-1/4 p-2 m-2 border-4 rounded-lg bg-white text-lg font-medium">
                        Actual Time:  {time}
                    </div>
                    <div className="p-2 w-1/4">
                        {(() => {
                            switch (raceState) {
                                case raceStateType.reset:
                                    return (<p onClick={startRaceButton} className="cursor-pointer text-white bg-green-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                        Start
                                    </p>)
                                case raceStateType.stopped:
                                    return (<p onClick={resetRace} className="cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                        Reset
                                    </p>)
                                case raceStateType.calculate:
                                    return (<p onClick={submitResults} className="cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                        Submit Results
                                    </p>)
                                default: //countdown and starting and allStarted
                                    return (<p onClick={(e) => { confirm("are you sure you want to stop the race?") ? stopRace() : null; }} className="cursor-pointer text-white bg-red-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                        Stop
                                    </p>)
                            }
                        })()}
                    </div>
                </div>

                <div className="">
                    <ReactSortable handle=".handle" list={race.fleets.flatMap(fleet => fleet.results)} setList={(newState) => setOrder(newState)}>
                        {race.fleets.flatMap(fleet => fleet.results).map((result: ResultsDataType, index) => {
                            return (
                                <div key={index}>
                                    {(result.resultCode != "") ?
                                        <div key={index} id={result.id} className={'bg-red-300 border-2 border-pink-500'}>
                                            <div className="flex flex-row m-4 justify-between">
                                                <h2 className="text-2xl text-gray-700 flex my-auto mr-5"> <span className="handle cursor-row-resize px-3">☰</span>{result.SailNumber} - {result.boat?.name} : {result.Helm} - {result.Crew} -</h2>
                                                <div className="flex">
                                                    <h2 className="text-2xl text-gray-700 flex my-auto mr-5">{result.resultCode} </h2>

                                                </div>
                                            </div>
                                        </div>
                                        :
                                        <div id={result.id} className={'bg-green-300 border-2 border-pink-500'}>
                                            <div className="flex flex-row m-4 justify-between">
                                                <h2 className="text-2xl text-gray-700 flex my-auto mr-5"> <span className="handle cursor-row-resize px-3">☰</span>{result.SailNumber} - {result.boat?.name} : {result.Helm} - {result.Crew} -</h2>
                                                {(raceState == raceStateType.running) ?
                                                    <div className="flex">
                                                        <p onClick={(e) => { confirm("are you sure you want to retire " + result.SailNumber) ? retireBoat(result.id) : null; }} className="cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-sm p-5 mx-2 ml-auto text-center flex">
                                                            Retire
                                                        </p>
                                                        <h2 className="text-2xl text-gray-700 flex my-auto mr-5">Laps: {result.laps.length} Position: {result.PursuitPosition} </h2>
                                                        <h2 className="text-2xl text-gray-700 flex my-auto mr-5"> Start Time: {String(Math.floor((result.boat?.pursuitStartTime || 0) / 60)).padStart(2, '0')}:{String((result.boat?.pursuitStartTime || 0) % 60).padStart(2, '0')}</h2>
                                                        <p onClick={() => lapBoat(result.id)} className="cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-sm p-5 mx-2 text-center flex">
                                                            lap
                                                        </p>
                                                    </div>
                                                    :
                                                    <>
                                                        <h2 className="text-2xl text-gray-700 flex my-auto mr-5">Laps: {result.laps.length} Position: {result.PursuitPosition} </h2>
                                                        <h2 className="text-2xl text-gray-700 flex my-auto mr-5"> Start Time: {String(Math.floor((result.boat?.pursuitStartTime || 0) / 60)).padStart(2, '0')}:{String((result.boat?.pursuitStartTime || 0) % 60).padStart(2, '0')}</h2>

                                                    </>
                                                }
                                            </div>
                                        </div>
                                    }
                                </div>
                            )
                        })
                        }
                    </ReactSortable>
                </div>
            </div>
        </Dashboard >
    )
}

export default RacePage