'use client'
import React, { ChangeEvent, MouseEventHandler, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import * as DB from 'components/apiMethods';
import RaceTimer from "components/HRaceTimer"
import Cookies from "js-cookie";
import * as Fetcher from 'components/Fetchers';
import { Button, useDisclosure } from "@nextui-org/react";
import RetireModal from "components/ui/dashboard/RetireModal";
import BoatCard from "components/ui/race/BoatCard";
import { PageSkeleton } from "components/ui/PageSkeleton";
import { mutate } from "swr";

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

export default function Page({ params }: { params: { slug: string } }) {

    const Router = useRouter()

    const startLength = 315 //5 15secs in seconds

    const { user, userIsError, userIsValidating } = Fetcher.UseUser()
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()

    const { race, raceIsError, raceIsValidating } = Fetcher.Race(params.slug, true)

    var [seriesName, setSeriesName] = useState("")

    const retireModal = useDisclosure();

    var [lastAction, setLastAction] = useState<{ type: string, resultId: string }>({ type: "", resultId: "" })

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
        HandicapPosition: 0,
        resultCode: "",
        fleetId: ""
    })

    const [mode, setMode] = useState(modeType.Lap)

    const [dynamicSorting, setDynamicSorting] = useState(true)

    const startRaceButton = async (fleetId: string) => {
        //use time for button
        let localTime = Math.floor((new Date().getTime() / 1000) + startLength)
        //start the timer
        fetch("http://" + club.settings.clockIP + "/set?startTime=" + (localTime - club.settings.clockOffset).toString(), { signal: controller.signal, mode: 'no-cors' }).catch((err) => {
            console.log("clock not connected")
            console.log(err)
        })

        //Update database
        let fleet = race.fleets.find(fleet => fleet.id == fleetId)
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
        let index = race.fleets.findIndex(fleet => fleet.id == fleetId)
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

    const sortByPY = async (results: ResultsDataType[]) => {
        results.sort((a, b) => {
            if (a.boat.py - b.boat.py != 0) {
                return a.boat.py - b.boat.py
            } else {
                return parseInt(a.SailNumber) - parseInt(b.SailNumber)
            }
        });

        results.forEach((res, index) => {
            const element = document.getElementById(res.id)
            if (element) {
                element.style.order = index.toString()
            }
        })
    }

    const dynamicSort = async (results: ResultsDataType[]) => {
        results.sort((a, b) => {
            //if done a lap, predicted is sum of lap times + last lap.
            //if no lap done, predicted is py.
            let start = race.fleets.find(fleet => fleet.id == a.fleetId)?.startTime || 0
            let aPredicted = a.laps.length > 0 ? (a.laps[a.laps.length - 1]!.time) + (a.laps[a.laps.length - 1]!.time) - ((a.laps[a.laps.length - 2]?.time) || start) : a.boat.py
            let bPredicted = b.laps.length > 0 ? (b.laps[b.laps.length - 1]!.time) + (b.laps[b.laps.length - 1]!.time) - ((b.laps[b.laps.length - 2]?.time) || start) : b.boat.py
            //force resultcodes to the end
            if (a.resultCode != "") {
                aPredicted = Number.MAX_SAFE_INTEGER
            }
            if (b.resultCode != "") {
                bPredicted = Number.MAX_SAFE_INTEGER
            }
            //force finished one off end
            if (a.finishTime != 0) {
                aPredicted = Number.MAX_SAFE_INTEGER - 1
            }
            if (b.finishTime != 0) {
                bPredicted = Number.MAX_SAFE_INTEGER - 1
            }
            return aPredicted - bPredicted;
        });

        results.forEach((res, index) => {
            const element = document.getElementById(res.id)
            if (element) {
                element.style.order = index.toString()
            }
        })
    }

    const sortByLastLap = (results: ResultsDataType[]) => {
        results.sort((a, b) => {

            //get last lap time, not including last lap.
            let aIndex = a.finishTime != 0 ? 2 : 1
            let bIndex = b.finishTime != 0 ? 2 : 1
            let aLast = a.laps[a.laps.length - aIndex]?.time || 0
            let bLast = b.laps[b.laps.length - bIndex]?.time || 0
            //force resultcodes to the end
            if (a.resultCode != "") {
                aLast = Number.MAX_SAFE_INTEGER
            }
            if (b.resultCode != "") {
                bLast = Number.MAX_SAFE_INTEGER
            }
            return aLast - bLast;
        });

        results.forEach((res, index) => {
            const element = document.getElementById(res.id)
            if (element) {
                element.style.order = index.toString()
            }
        })
        return results
    }

    const stopRace = async (fleetId: string) => {
        let index = race.fleets.findIndex(fleet => fleet.id == fleetId)
        //modify racestate at index to match fleet index
        setRaceState([...raceState.slice(0, index), raceStateType.stopped, ...raceState.slice(index + 1)])
        fetch("http://" + club.settings.clockIP + "/reset", { signal: controller.signal, mode: 'no-cors' }).catch(function (err) {
            console.log('Clock not connected: ', err);
        });
    }

    const resetRace = async (fleetId: string) => {
        let fleet = race.fleets.find(fleet => fleet.id == fleetId)
        if (fleet == undefined) {
            console.error("fleet not found")
            return
        }
        //add are you sure here
        fetch("http://" + club.settings.clockIP + "/reset", { signal: controller.signal, mode: 'no-cors' }).catch(function (err) {
            console.log('Clock not connected: ', err);
        });

        let index = race.fleets.findIndex(fleet => fleet.id == fleetId)
        //modify racestate at index to match fleet index
        setRaceState([...raceState.slice(0, index), raceStateType.reset, ...raceState.slice(index + 1)])

        //Update database
        fleet.startTime = 0
        await DB.updateFleetById(fleet)
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

    const retireBoat = async (resultCode: string) => {
        retireModal.onClose()
        let tempdata = activeResult
        tempdata.resultCode = resultCode
        await DB.updateResult(tempdata)

        let data = await DB.getRaceById(race.id)
        //mutate race


    }

    const lapBoat = async (resultId: string) => {
        let result: ResultsDataType | undefined;
        race.fleets.some(fleet => {
            result = fleet.results.find(result => result.id === resultId);
            return result !== undefined;
        });
        if (result == undefined) {
            console.error("Could not find result with id: " + resultId);
            return
        }
        //save state for undo
        setLastAction({ type: "lap", resultId: resultId })

        await DB.CreateLap(resultId, Math.floor(new Date().getTime() / 1000))
        //load back race data

        //mutate race
        mutate(`/api/GetRaceById?id=${race.id}&results=true`)

        let sound = document.getElementById("Beep") as HTMLAudioElement
        sound!.currentTime = 0
        sound!.play();
    }

    const calculateResults = () => {
        //most nuber of laps.
        console.log(race)
        race.fleets.forEach(fleet => {
            const maxLaps = Math.max.apply(null, fleet.results.map(function (o: ResultsDataType) { return o.laps.length }))
            console.log(maxLaps)
            if (!(maxLaps >= 0)) {
                console.log("max laps not more than one")
                return
            }
            const resultsData = race.fleets.flatMap(fleet => fleet.results)

            //calculate corrected time
            resultsData.forEach(result => {
                if (result.finishTime == 0) {
                    result.CorrectedTime = 0
                    return
                }
                let seconds = result.finishTime - fleet.startTime
                result.CorrectedTime = (seconds * 1000 * (maxLaps / result.laps.length)) / result.boat.py
                result.CorrectedTime = Math.round(result.CorrectedTime * 10) / 10
            });

            //calculate finish position

            const sortedResults = fleet.results.sort((a, b) => {
                if (a.resultCode != "") {
                    return 1
                }
                if (b.resultCode != "") {
                    return -1
                }
                if (a.CorrectedTime > b.CorrectedTime) {
                    return 1
                }
                if (a.CorrectedTime < b.CorrectedTime) {
                    return -1
                }
                return 0
            })

            console.log(sortedResults)

            sortedResults.forEach((result, index) => {
                if (result.resultCode != "") {
                    console.log(result)
                    result.HandicapPosition = fleet.results.length
                } else {
                    result.HandicapPosition = index + 1;
                }
            });

            sortedResults.forEach(result => {
                DB.updateResult(result)
            })

            console.log(sortedResults)
        })
        Router.push('/Race/' + race.id)

    }

    const finishBoat = async (resultId: string) => {
        const time = Math.floor(new Date().getTime() / 1000)
        //sound horn
        fetch("http://" + club.settings.hornIP + "/short", { signal: controller.signal, mode: 'no-cors' }).then(response => {
        }).catch((err) => {
            console.log("horn not connected")
            console.log(err)
        })

        await DB.CreateLap(resultId, time)

        let result = race.fleets.flatMap(fleet => fleet.results).find(result => result.id === resultId);

        if (result == undefined) {
            console.error("Could not find result with id: " + resultId);
            return
        }
        //save state for undo
        setLastAction({ type: "finish", resultId: resultId })

        //send to DB
        await DB.updateResult({ ...result, finishTime: time })

        //mutate race
        mutate(`/api/GetRaceById?id=${race.id}&results=true`)

        let sound = document.getElementById("Beep") as HTMLAudioElement
        sound!.currentTime = 0
        sound!.play();
    }

    const checkAllFinished = (fleet: FleetDataType) => {
        //check if all boats in fleet have finished
        let results = fleet.results
        let allFinished = true
        results.forEach(data => {
            if (data.finishTime == 0 && data.resultCode == "") {
                allFinished = false
            }
        })
        return allFinished
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
        const fetchRace = async () => {
            setSeriesName(await DB.GetSeriesById(race.seriesId).then((res) => { return (res.name) }))
            setRaceState(race.fleets.map((fleet) => {
                if (checkAllFinished(fleet)) {
                    return raceStateType.calculate
                } else if (fleet.startTime != 0) {
                    return raceStateType.running
                } else {
                    return raceStateType.reset
                }
            }))
        }

        if (race != undefined) {
            fetchRace()
        }

    }, [race])

    useEffect(() => {
        if (race == undefined) return
        //sort results
        if (dynamicSorting) {
            if (mode == modeType.Finish) {
                sortByLastLap(race.fleets.flatMap(fleet => fleet.results))
            }
            else if (mode == modeType.Lap) {
                dynamicSort(race.fleets.flatMap(fleet => fleet.results))
            }
        }
        else {
            sortByPY(race.fleets.flatMap(fleet => fleet.results))
        }

        race.fleets.forEach((fleet, index) => {
            if (checkAllFinished(fleet)) {
                setRaceState([...raceState.slice(0, index), raceStateType.calculate, ...raceState.slice(index + 1)])
            }
            else if (fleet.startTime != 0) {
                setRaceState([...raceState.slice(0, index), raceStateType.running, ...raceState.slice(index + 1)])
            }
        })
    }, [race, dynamicSorting, mode])

    if (raceIsError || race == undefined || clubIsError || club == undefined || userIsError || user == undefined) {
        return <PageSkeleton />
    }

    return (
        <>
            <RetireModal isOpen={retireModal.isOpen} onSubmit={retireBoat} onClose={retireModal.onClose} result={activeResult} />
            <audio id="Beep" src="/Beep-6.mp3" ></audio>
            <audio id="Countdown" src="/Countdown.mp3" ></audio>
            <div className="w-full flex flex-col items-center justify-start panel-height">
                <div className="flex w-full flex-col justify-around" key={JSON.stringify(raceState)}>

                    {race.fleets.map((fleet, index) => {
                        return (
                            <div className="flex flex-row" key={"fleetBar" + index}>
                                <div className="w-1/4 p-2 m-2 border-4 rounded-lg  text-lg font-medium">
                                    Event: {seriesName} - {race.number} - {fleet.fleetSettings.name}
                                </div>
                                <div className="w-1/4 p-2 m-2 border-4 rounded-lg text-lg font-medium">
                                    Race Time: <RaceTimer key={"fleetTimer" + index} startTime={fleet.startTime} timerActive={raceState[index] == raceStateType.running} onFiveMinutes={handleFiveMinutes} onFourMinutes={handleFourMinutes} onOneMinute={handleOneMinute} onGo={handleGo} onWarning={handleWarning} reset={raceState[index] == raceStateType.reset} />
                                </div>
                                <div className="p-2 w-1/4" id="RaceStateButton">
                                    {(() => {
                                        switch (raceState[index]) {
                                            case raceStateType.reset:
                                                return (<Button onClick={() => startRaceButton(fleet.id)} size="lg" color="success" fullWidth>
                                                    Start
                                                </Button>)
                                            case raceStateType.running:
                                                return (<Button onClick={(e) => { confirm("are you sure you want to stop the race?") ? stopRace(fleet.id) : null; }} size="lg" color="danger" fullWidth>
                                                    Stop
                                                </Button>)
                                            case raceStateType.stopped:
                                                return (<Button onClick={() => resetRace(fleet.id)} size="lg" color="primary" fullWidth>
                                                    Reset
                                                </Button>)
                                            case raceStateType.calculate:
                                                return (<Button id="CalcResultsButton" onClick={calculateResults} size="lg" color="primary" fullWidth>
                                                    Calculate Results
                                                </Button>)
                                            default:
                                                return (<p> unknown race state</p>)
                                        }
                                    })()}
                                </div>
                            </div>
                        )
                    })
                    }
                </div>
                <div className="flex w-full shrink flex-row justify-around">
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
                    <div className="w-1/5 p-2" id="FinishModeButton">
                        <Button onClick={() => setMode(modeType.Finish)} size="lg" color={mode == modeType.Finish ? "success" : "primary"} fullWidth>
                            Finish Mode
                        </Button>
                    </div>
                </div>
                <div className="overflow-auto">
                    <div className="flex flex-row justify-around flex-wrap" id="EntrantCards">
                        {race.fleets.flatMap(fleets => fleets.results).map((result: ResultsDataType, index) => {
                            let fleetIndex = race.fleets.findIndex(fleet => fleet.id == result.fleetId)
                            return <BoatCard key={result.id} result={result} fleet={race.fleets.find((fleet) => fleet.id == result.fleetId)!} raceState={raceState[fleetIndex]!} mode={mode} lapBoat={lapBoat} finishBoat={finishBoat} showRetireModal={showRetireModal} />

                        })}
                    </div>
                </div>
            </div>
        </>
    )
}
