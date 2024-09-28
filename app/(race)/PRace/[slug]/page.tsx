'use client'
import React, { ChangeEvent, MouseEventHandler, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import * as DB from 'components/apiMethods';
import PursuitTimer from "components/PRaceTimer"
import Cookies from "js-cookie";
import * as Fetcher from 'components/Fetchers';
import { mutate } from "swr";
import { PageSkeleton } from "components/ui/PageSkeleton";
import { Button, useDisclosure } from "@nextui-org/react";
import PursuitCard from "components/ui/race/PursuitCard";
import PursuitTable from "components/ui/race/PursuitTable";
import RetireModal from "components/ui/dashboard/RetireModal";

enum raceStateType {
    running,
    stopped,
    reset,
    calculate
}

enum modeType {
    Retire,
    Lap,
    NotStarted
}

//pursuit races don't work with fleets, why would you?
//race organisation if based off of the first fleet, all boats from any fleets are used.

export default function Page({ params }: { params: { slug: string } }) {

    const Router = useRouter()

    const retireModal = useDisclosure();

    const startLength = 315 //5 mins 15 seconds in seconds

    var [seriesName, setSeriesName] = useState("")

    const { user, userIsError, userIsValidating } = Fetcher.UseUser()
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { race, raceIsError, raceIsValidating, mutateRace } = Fetcher.Race(params.slug, true)

    var [raceState, setRaceState] = useState<raceStateType>(raceStateType.reset)
    const [mode, setMode] = useState(modeType.NotStarted)

    const [dynamicSorting, setDynamicSorting] = useState(true)
    var [lastAction, setLastAction] = useState<{ type: string, resultId: string }>({ type: "", resultId: "" })

    const [activeResult, setActiveResult] = useState<ResultsDataType>({} as ResultsDataType)


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
        race.fleets.forEach(async fleet => {
            fleet.startTime = localTime
            await DB.updateFleetById(fleet)
        })
        mutateRace()
        startRace()
    }

    const startRace = async () => {
        setRaceState(raceStateType.running)
        setMode(modeType.Lap)
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
        setRaceState(raceStateType.stopped)
        const timeoutId = setTimeout(() => controller.abort(), 2000)
        fetch("http://" + club.settings.clockIP + "/reset", { signal: controller.signal, mode: 'no-cors' }).then(response => {
            clearTimeout(timeoutId)
        }).catch(function (err) {
            console.log('Clock not connected: ', err);
        });
    }

    const resetRace = async () => {
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

    const dynamicSort = async () => {
        //recalculate position
        let racesCopy: RaceDataType = window.structuredClone(race)
        // there is just one fleet so grab the first one
        racesCopy.fleets[0]!.results.sort((a: ResultsDataType, b: ResultsDataType) => {
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

        racesCopy.fleets.flatMap(fleet => fleet.results).forEach(async (result, index) => {
            //there is only one fleet
            // updatedData.fleets[0]!.results[index]!.PursuitPosition = index + 1
            result.PursuitPosition = index + 1
            await DB.updateResult(result)
        })

        await mutateRace()
    }


    const retireBoat = async (resultCode: string) => {
        let tempdata = activeResult
        tempdata.resultCode = resultCode
        let oldPosition = tempdata.PursuitPosition
        tempdata.PursuitPosition = 0
        await DB.updateResult(tempdata)

        setLastAction({ type: "retire", resultId: tempdata.id })

        //shift all boats up to fill the gap
        let raceCopy: RaceDataType = window.structuredClone(race)
        for (let i = oldPosition + 1; i < raceCopy.fleets[0]!.results.length - 1; i++) {
            if (raceCopy.fleets[0]!.results[i]!.PursuitPosition != 0) {
                raceCopy.fleets[0]!.results[i]!.PursuitPosition = raceCopy.fleets[0]!.results[i]!.PursuitPosition - 1
                await DB.updateResult(raceCopy.fleets[0]!.results[i]!)
            }
        }


        mutateRace()
        retireModal.onClose()
    }

    const moveUp = async (id: string) => {
        console.log("move up")
        //move selected boat up and boat above it down
        let toMoveUp = race.fleets.flatMap(fleet => fleet.results).find(result => result.id === id)
        let toMoveDown = race.fleets.flatMap(fleet => fleet.results).find(result => result.PursuitPosition == toMoveUp!.PursuitPosition - 1)
        if (toMoveDown == undefined) {
            console.error("no boat to move down")
            return
        }
        if (toMoveUp == undefined) {
            console.error("no boat to move up")
            return
        }

        toMoveUp.PursuitPosition = toMoveUp.PursuitPosition - 1
        toMoveDown.PursuitPosition = toMoveDown.PursuitPosition + 1
        await DB.updateResult(toMoveUp)
        await DB.updateResult(toMoveDown)

        mutateRace()
    }

    const moveDown = async (id: string) => {
        //move selected boat up and boat above it down
        let toMoveDown = race.fleets.flatMap(fleet => fleet.results).find(result => result.id === id)
        let toMoveUp: ResultsDataType | undefined = race.fleets.flatMap(fleet => fleet.results).find(result => result.PursuitPosition == toMoveDown!.PursuitPosition + 1)
        if (toMoveDown == undefined) {
            console.error("no boat to move down")
            return
        }
        if (toMoveUp == undefined) {
            console.error("no boat to move up")
            return
        }

        toMoveUp.PursuitPosition = toMoveUp.PursuitPosition - 1
        toMoveDown.PursuitPosition = toMoveDown.PursuitPosition + 1
        await DB.updateResult(toMoveUp)
        await DB.updateResult(toMoveDown)

        mutateRace()
    }

    const lapBoat = async (id: string) => {
        //modify local race data

        await DB.CreateLap(id, Math.floor(new Date().getTime() / 1000))
        await mutateRace()

        if (dynamicSorting) {
            dynamicSort()
        }

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
        Router.push('/Race/' + race.id)
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

    const showRetireModal = (resultId: String) => {
        retireModal.onOpen()
        let result: ResultsDataType | undefined;
        race.fleets.some(fleet => {
            result = fleet.results.find(result => result.id === resultId);
            return result !== undefined;
        });
        if (result == undefined) {
            console.error("Could not find result with id: " + resultId);
            return
        }
        setActiveResult(result)
    }

    const undo = async () => {
        if (lastAction.type == "") {
            //no action has been done yet
            return;
        }
        if (!confirm("are you sure you want to undo your last " + lastAction.type + "?")) {
            return
        }

        let actionResult = race.fleets.flatMap(fleet => fleet.results).find(result => result.id === lastAction.resultId);
        if (actionResult == undefined) {
            console.error("Could not find result with id: " + lastAction.resultId);
            return
        }
        //revert to last result
        if (lastAction.type == "lap") {
            let lapId = actionResult.laps.slice(-1)[0]?.id
            if (lapId == undefined) {
                console.error("no lap to delete")
                return
            }
            await DB.DeleteLapById(lapId)
        }
        else if (lastAction.type == "finish") {
            let lapId = actionResult.laps.slice(-1)[0]?.id
            if (lapId == undefined) {
                console.error("no finish lap to delete")
                return
            }
            await DB.DeleteLapById(lapId)
            await DB.updateResult({ ...actionResult, finishTime: 0 })
        }


        //mutate race

    }


    const controller = new AbortController()

    useEffect(() => {
        const loadRace = async () => {
            if (race.fleets[0]?.startTime != 0) {
                setRaceState(raceStateType.running)
                //check if race has already finished
                if (Math.floor((new Date().getTime() / 1000) - race.fleets[0]!.startTime) > (club.settings.pursuitLength * 60)) {
                    setRaceState(raceStateType.calculate)
                }
            }
            setSeriesName(await DB.GetSeriesById(race.seriesId).then((res) => { return (res.name) }))
        }

        if (race != undefined) {
            loadRace()
        }

    }, [race])

    const [time, setTime] = useState("");

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date().toTimeString().split(' ')[0]!), 1000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    if (race == undefined) {
        return <PageSkeleton />
    }

    return (
        <>
            <RetireModal isOpen={retireModal.isOpen} onSubmit={retireBoat} onClose={retireModal.onClose} result={activeResult} />
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
                <div className="flex w-full shrink flex-row justify-left">
                    <div className="w-1/5 p-2">
                        {dynamicSorting ?
                            <Button onClick={() => setDynamicSorting(false)} size="lg" color="success" fullWidth>
                                Dynamic Sorting: On
                            </Button>
                            :
                            <Button onClick={() => setDynamicSorting(true)} size="lg" color="warning" fullWidth>
                                Dynamic Sorting: Off
                            </Button>
                        }
                    </div>
                    <div className="w-1/5 p-2">
                        <Button onClick={() => undo()} size="lg" color="danger" fullWidth>
                            Undo
                        </Button>
                    </div>
                    <div className="w-1/5 p-2" id="RetireModeButton">
                        <Button onClick={() => setMode(modeType.Retire)} size="lg" color={mode == modeType.Retire ? "success" : "primary"} fullWidth>
                            Retire Mode
                        </Button>
                    </div>
                    <div className="w-1/5 p-2" id="LapModeButton">
                        <Button onClick={() => setMode(modeType.Lap)} size="lg" color={mode == modeType.Lap ? "success" : "primary"} fullWidth>
                            Lap Mode
                        </Button>
                    </div>
                </div>
                <div className="">
                    <PursuitTable fleetId={race.fleets[0]!.id} raceState={raceState} raceMode={mode} dynamicSorting={dynamicSorting} moveUp={moveUp} moveDown={moveDown} lapBoat={lapBoat} showRetireModal={showRetireModal} />
                </div>
            </div>
        </>
    )
}