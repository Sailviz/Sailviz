'use client'
import React, { ChangeEvent, MouseEventHandler, use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
// import RaceTimer from '@/components/HRaceTimer'

import * as Fetcher from '@/components/Fetchers'
import RetireModal from '@/components/layout/dashboard/RetireModal'
import BoatCard from '@/components/layout/race/BoatCard'
import { PageSkeleton } from '@/components/layout/PageSkeleton'
import { mutate } from 'swr'
import FlagModal from '@/components/layout/dashboard/Flag Modal'
import { Button } from '@/components/ui/button'
import RaceTimer from '@/components/layout/race/raceTimer'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { DropdownMenuContent, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { CaretDownIcon } from '@radix-ui/react-icons'
import FleetSelectDialog from '@/components/layout/dashboard/FleetSelectModal'
import { useSession } from '@/lib/auth-client'

// these options are the same across all fleets
enum raceStateType {
    running,
    stopped,
    reset,
    calculate,
    retire
}

// these options are specific to each fleet
enum raceModeType {
    Lap,
    Finish,
    None
}

type PageProps = { params: Promise<{ raceId: string }> }

export default function Page(props: PageProps) {
    const { raceId } = use(props.params)
    const Router = useRouter()

    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()

    const { race, raceIsError, raceIsValidating } = Fetcher.Race(raceId, true)
    const { startSequence, startSequenceIsError, startSequenceIsValidating, mutateStartSequence } = Fetcher.GetStartSequence(race?.seriesId)

    const [retireModal, setRetireModal] = useState(false)
    const [fleetSelectModal, setFleetSelectModal] = useState(false)
    const [selectMode, setSelectMode] = useState<raceModeType>(raceModeType.None)
    const [flagModal, setFlagModal] = useState(false)
    const [flagStatus, setFlagStatus] = useState<boolean[]>([false, false])
    const [nextFlagStatus, setNextFlagStatus] = useState<boolean[]>([false, false])

    var [lastAction, setLastAction] = useState<{ type: string; resultId: string }>({ type: '', resultId: '' })

    const [raceState, setRaceState] = useState<raceStateType>(raceStateType.reset)
    const [lastRaceState, setLastRaceState] = useState<raceStateType>(raceStateType.reset)
    const [raceMode, setRaceMode] = useState<raceModeType[]>([])
    const [activeResult, setActiveResult] = useState<ResultDataType>({
        id: '',
        Helm: '',
        Crew: '',
        boat: {
            id: '',
            name: '',
            crew: 0,
            py: 0,
            clubId: '',
            pursuitStartTime: 0
        },
        SailNumber: '',
        finishTime: 0,
        CorrectedTime: 0,
        numberLaps: 0,
        laps: [
            {
                time: 0,
                id: '',
                resultId: ''
            }
        ],
        PursuitPosition: 0,
        HandicapPosition: 0,
        resultCode: '',
        fleetId: ''
    })

    const startRaceButton = async () => {
        //use time for button
        let lastStartTime = Math.floor(new Date().getTime() / 1000 + startSequence.reduce((max, step) => (step.time > max ? step.time : max), 0))
        //start the timer
        fetch('https://' + club.settings.clockIP + '/set?startTime=' + (lastStartTime - club.settings.clockOffset).toString(), {
            signal: controller.signal,
            mode: 'no-cors'
        }).catch(err => {
            console.log('clock not connected')
            console.log(err)
        })

        race.fleets.forEach(async fleet => {
            //find start time in start sequence
            let startTimeStep = startSequence.find(step => step.fleetStart == fleet.fleetSettings.id)
            if (startTimeStep == undefined) {
                console.error('No start time found for fleet: ' + fleet.id)
                return
            }
            fleet.startTime = lastStartTime - startTimeStep.time
            console.log('Setting start time for fleet ' + fleet.id + ' to ' + fleet.startTime)
            await DB.updateFleetById(fleet)
        })

        setFlagModal(true)
        //set flag status to false
        setFlagStatus([false, false])
        setNextFlagStatus([true, false])
        //send to DB
        startRace()
    }

    const startRace = async () => {
        //modify racestate to running for all fleets
        setRaceState(raceStateType.running)

        let sound = document.getElementById('Beep') as HTMLAudioElement
        sound!.currentTime = 0
        sound!.play()
    }

    const handleFlagChange = (flags: FlagStatusType[], next?: FlagStatusType[]) => {
        console.log(`Flag changed to: ${flags.map(flag => `${flag.flag}:${flag.status}`).join(', ')}`)
        setFlagStatus([flags[0]!.status, flags[1]!.status])
        if (next) {
            setNextFlagStatus([next[0]!.status, next[1]!.status])
        }
    }

    const handleHoot = (time: number) => {
        //sound horn
        fetch('https://' + club.settings.hornIP + `/hoot?startTime=${time}`, {
            signal: controller.signal,
            headers: new Headers({ 'content-type': 'text/plain' })
        })
            .then(response => {})
            .catch(err => {
                console.log('horn not connected')
                console.log(err)
            })

        let sound = document.getElementById('Beep') as HTMLAudioElement
        sound!.currentTime = 0
        sound!.play()
    }

    const handleWarning = () => {
        console.log('Warning')

        let sound = document.getElementById('Countdown') as HTMLAudioElement
        sound!.currentTime = 0
        sound!.play()

        //this is to cache the horn TLS so that when it needs to hoot it is quicker.
        fetch('https://' + club.settings.hornIP + '/reset', {
            signal: controller.signal,
            headers: new Headers({ 'content-type': 'text/plain' })
        })
    }

    const handleSequenceEnd = () => {
        setFlagModal(false)
    }

    const handleFleetStart = (fleetSettingsId: string) => {
        //set fleet running
        let index = race.fleets.findIndex(fleet => fleet.fleetSettings.id == fleetSettingsId)
        if (index == -1) {
            console.error('Fleet not found with settings: ' + fleetSettingsId)
            return
        }
        setRaceMode([...raceMode.slice(0, index), raceModeType.Lap, ...raceMode.slice(index + 1)])
    }

    const dynamicSort = async (results: ResultDataType[]) => {
        results.sort((a, b) => {
            //if done a lap, predicted is sum of lap times + last lap.
            //if no lap done, predicted is py.
            let start = race.fleets.find(fleet => fleet.id == a.fleetId)?.startTime || 0
            let aPredicted =
                a.laps.length > 0
                    ? a.laps[a.laps.length - 1]!.time + a.laps[a.laps.length - 1]!.time - (a.laps[a.laps.length - 2]?.time || start)
                    : a.boat.py + parseInt(a.SailNumber) / 100000
            let bPredicted =
                b.laps.length > 0
                    ? b.laps[b.laps.length - 1]!.time + b.laps[b.laps.length - 1]!.time - (b.laps[b.laps.length - 2]?.time || start)
                    : b.boat.py + parseInt(b.SailNumber) / 100000
            //force resultcodes to the end
            if (a.resultCode != '') {
                aPredicted = Number.MAX_SAFE_INTEGER
            }
            if (b.resultCode != '') {
                bPredicted = Number.MAX_SAFE_INTEGER
            }
            //force finished one off end
            if (a.finishTime != 0) {
                aPredicted = Number.MAX_SAFE_INTEGER - 1
            }
            if (b.finishTime != 0) {
                bPredicted = Number.MAX_SAFE_INTEGER - 1
            }
            return aPredicted - bPredicted
        })

        results.forEach((res, index) => {
            const element = document.getElementById(res.id)
            //loop until we find an element that exists

            if (element) {
                element.style.order = index.toString()
            }
        })
    }

    const sortByLastLap = (results: ResultDataType[]) => {
        results.sort((a, b) => {
            //get last lap time, not including last lap.
            let aIndex = a.finishTime != 0 ? 2 : 1
            let bIndex = b.finishTime != 0 ? 2 : 1
            let aLast = a.laps[a.laps.length - aIndex]?.time || 0
            let bLast = b.laps[b.laps.length - bIndex]?.time || 0
            //force resultcodes to the end
            if (a.resultCode != '') {
                aLast = Number.MAX_SAFE_INTEGER
            }
            if (b.resultCode != '') {
                bLast = Number.MAX_SAFE_INTEGER
            }
            return aLast - bLast
        })

        results.forEach((res, index) => {
            const element = document.getElementById(res.id)
            if (element) {
                element.style.order = index.toString()
            }
        })
        return results
    }

    const stopRace = async () => {
        setRaceState(raceStateType.stopped)
        fetch('https://' + club.settings.clockIP + '/reset', { signal: controller.signal, mode: 'no-cors' }).catch(function (err) {
            console.log('Clock not connected: ', err)
        })
    }

    const resetRace = async () => {
        //add are you sure here
        fetch('https://' + club.settings.clockIP + '/reset', { signal: controller.signal, mode: 'no-cors' }).catch(function (err) {
            console.log('Clock not connected: ', err)
        })

        setRaceState(raceStateType.reset)

        //Update database
        race.fleets.forEach(async fleet => {
            fleet.startTime = 0
            await DB.updateFleetById(fleet)
        })
    }

    const showRetireModal = (resultId: String) => {
        setRetireModal(true)
        let result: ResultDataType | undefined
        race.fleets.some(fleet => {
            result = fleet.results.find(result => result.id === resultId)
            return result !== undefined
        })
        if (result == undefined) {
            console.error('Could not find result with id: ' + resultId)
            return
        }
        setActiveResult(result)
    }

    const retireBoat = async (resultCode: string) => {
        // retireModal.onClose()
        let tempdata = activeResult
        tempdata.resultCode = resultCode
        await DB.updateResult(tempdata)

        let data = await DB.getRaceById(race.id)
        //mutate race

        //change back to lap mode
        setRetireModal(false)
        setRaceState(lastRaceState)
    }

    const lapBoat = async (resultId: string) => {
        let result: ResultDataType | undefined
        race.fleets.some(fleet => {
            result = fleet.results.find(result => result.id === resultId)
            return result !== undefined
        })
        if (result == undefined) {
            console.error('Could not find result with id: ' + resultId)
            return
        }
        //we have the data to do the lap, so beep user
        let sound = document.getElementById('Beep') as HTMLAudioElement
        sound!.currentTime = 0
        sound!.play()
        //save state for undo
        setLastAction({ type: 'lap', resultId: resultId })

        // await DB.CreateLap(resultId, Math.floor(new Date().getTime() / 1000))
        //load back race data
        let optimisticData: RaceDataType = window.structuredClone(race)
        //update optimistic data with new lap
        optimisticData.fleets.forEach((fleet: FleetDataType) => {
            fleet.results.forEach(res => {
                if (res.id == resultId) {
                    res.laps.push({ resultId: resultId, time: Math.floor(new Date().getTime() / 1000), id: '' })
                }
            })
        })
        console.log(optimisticData)
        //mutate race
        mutate(
            `/api/GetRaceById?id=${race.id}&results=true`,
            async update => {
                await DB.CreateLap(resultId, Math.floor(new Date().getTime() / 1000))
                return await DB.getRaceById(race.id, true)
            },
            { optimisticData: optimisticData, rollbackOnError: false, revalidate: false }
        )

        dynamicSort(optimisticData.fleets.flatMap(fleet => fleet.results))
    }

    const calculateResults = () => {
        //most nuber of laps.
        console.log(race)
        race.fleets.forEach(fleet => {
            const maxLaps = Math.max.apply(
                null,
                fleet.results.map(function (o: ResultDataType) {
                    return o.laps.length
                })
            )
            console.log(maxLaps)
            if (!(maxLaps >= 0)) {
                console.log('max laps not more than one')
                return
            }
            const resultsData = race.fleets.flatMap(fleet => fleet.results)

            //calculate corrected time
            resultsData.forEach(result => {
                console.log(result)
                //if we don't have a number of laps, set it to the number of laps
                if (result.numberLaps == 0) {
                    result.numberLaps = result.laps.length
                }
                if (result.finishTime == 0) {
                    result.CorrectedTime = 0
                    return
                }
                console.log(result.numberLaps)
                let seconds = result.finishTime - fleet.startTime
                result.CorrectedTime = (seconds * 1000 * (maxLaps / result.numberLaps)) / result.boat.py
                result.CorrectedTime = Math.round(result.CorrectedTime * 10) / 10
            })

            //calculate finish position

            const sortedResults = fleet.results.sort((a, b) => {
                if (a.resultCode != '') {
                    return 1
                }
                if (b.resultCode != '') {
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
                if (result.resultCode != '') {
                    console.log(result)
                    result.HandicapPosition = fleet.results.length
                } else {
                    result.HandicapPosition = index + 1
                }
            })

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
        fetch('http://' + club.settings.hornIP + '/hoot?startTime=200', { signal: controller.signal, mode: 'no-cors' })
            .then(response => {})
            .catch(err => {
                console.log('horn not connected')
                console.log(err)
            })
        //sound beep
        let sound = document.getElementById('Beep') as HTMLAudioElement
        sound!.currentTime = 0
        sound!.play()

        let result = race.fleets.flatMap(fleet => fleet.results).find(result => result.id === resultId)

        if (result == undefined) {
            console.error('Could not find result with id: ' + resultId)
            return
        }
        //save state for undo
        setLastAction({ type: 'finish', resultId: resultId })

        let optimisticData: RaceDataType = window.structuredClone(race)
        //update optimistic data with new lap
        optimisticData.fleets.forEach((fleet: FleetDataType) => {
            fleet.results.forEach(res => {
                if (res.id == resultId) {
                    res.finishTime = time
                    res.laps.push({ resultId: resultId, time: time, id: '' })
                }
            })
        })
        console.log(optimisticData)
        //mutate race
        mutate(
            `/api/GetRaceById?id=${race.id}&results=true`,
            async update => {
                await DB.CreateLap(resultId, time)

                await DB.updateResult({ ...result, finishTime: time })
                return await DB.getRaceById(race.id, true)
            },
            { optimisticData: optimisticData, rollbackOnError: false, revalidate: false }
        )
        //if more than one fleet, we need to force dynamic sort
        if (raceMode.length > 1) {
            dynamicSort(optimisticData.fleets.flatMap(fleet => fleet.results))
        } else {
            //if only one fleet, we can sort by last lap
            sortByLastLap(optimisticData.fleets.flatMap(fleet => fleet.results))
        }
    }

    const checkAllFinished = (results: ResultDataType[]) => {
        //check if all boats in fleet have finished
        let allFinished = true
        results.forEach(data => {
            if (data.finishTime == 0 && data.resultCode == '') {
                allFinished = false
            }
        })
        return allFinished
    }

    const checkAnyFinished = (results: ResultDataType[]) => {
        //check if any boats in fleet have finished
        let anyFinished = false
        results.forEach(data => {
            if (data.finishTime != 0) {
                anyFinished = true
            }
        })
        return anyFinished
    }

    const undo = async () => {
        if (lastAction.type == '') {
            //no action has been done yet
            return
        }
        if (!confirm('are you sure you want to undo your last ' + lastAction.type + '?')) {
            return
        }

        let actionResult = race.fleets.flatMap(fleet => fleet.results).find(result => result.id === lastAction.resultId)
        if (actionResult == undefined) {
            console.error('Could not find result with id: ' + lastAction.resultId)
            return
        }
        //revert to last result
        if (lastAction.type == 'lap') {
            let lapId = actionResult.laps.slice(-1)[0]?.id
            if (lapId == undefined) {
                console.error('no lap to delete')
                return
            }
            await DB.DeleteLapById(lapId)
        } else if (lastAction.type == 'finish') {
            let lapId = actionResult.laps.slice(-1)[0]?.id
            if (lapId == undefined) {
                console.error('no finish lap to delete')
                return
            }
            await DB.DeleteLapById(lapId)
            await DB.updateResult({ ...actionResult, finishTime: 0 })
        }

        //mutate race
    }

    const finishModeClick = () => {
        if (raceState == raceStateType.running) {
            if (race.fleets.length == 1) {
                setRaceMode([...raceMode.slice(0, 0), raceModeType.Finish, ...raceMode.slice(1)])
            } else {
                setSelectMode(raceModeType.Finish)
                setFleetSelectModal(true)
            }
        }
    }

    const lapModeClick = () => {
        //check if race is running
        if (raceState == raceStateType.running) {
            if (race.fleets.length == 1) {
                setRaceMode([...raceMode.slice(0, 0), raceModeType.Lap, ...raceMode.slice(1)])
            } else {
                setSelectMode(raceModeType.Lap)
                setFleetSelectModal(true)
            }
        }
    }

    const setFleetMode = (fleetId: string[], mode: raceModeType) => {
        console.log(fleetId)
        var tempRaceMode = [...raceMode]
        fleetId.forEach(id => {
            let index = race.fleets.findIndex(fleet => fleet.id == id)
            if (index == -1) {
                console.error('Fleet not found: ' + id)
                return
            }
            setFleetSelectModal(false)
            tempRaceMode = [...tempRaceMode.slice(0, index), mode, ...tempRaceMode.slice(index + 1)]
        })
        setRaceMode(tempRaceMode)
    }

    const controller = new AbortController()

    // useEffect(() => {
    //     if (mode == modeType.Finish) {
    //         sortByLastLap(race.fleets.flatMap(fleet => fleet.results))
    //     } else if (mode == modeType.Lap) {
    //         //this doesn't work on first load as the results are not loaded yet
    //         dynamicSort(race.fleets.flatMap(fleet => fleet.results))
    //     }
    // }, [mode])

    useEffect(() => {
        //sort by last lap when finish mode with single fleet
        //if there is more than one fleet, we don't sort by last lap as it would get confusing
        if (raceMode.length == 1 && raceMode[0] == raceModeType.Finish) {
            sortByLastLap(race.fleets.flatMap(fleet => fleet.results))
        } else if (raceMode.length == 1 && raceMode[0] == raceModeType.Lap) {
            //this doesn't work on first load as the results are not loaded yet
            dynamicSort(race.fleets.flatMap(fleet => fleet.results))
        }
    }, [raceMode])

    //on page
    useEffect(() => {
        if (race == undefined) return

        setRaceState(raceStateType.reset)
        dynamicSort(race.fleets.flatMap(fleet => fleet.results))

        //check for all fleets finished?
        if (checkAllFinished(race.fleets.flatMap(fleet => fleet.results))) {
            setRaceState(raceStateType.calculate)
        } else if (race.fleets.some(fleet => fleet.startTime != 0)) {
            setRaceState(raceStateType.running)
        }

        // check individual fleet states
        race.fleets.forEach(fleet => {
            let index = race.fleets.findIndex(f => f.id == fleet.id)
            if (checkAnyFinished(fleet.results)) {
                // if any boat in the fleet has finished, the fleet must be in finish mode
                setRaceMode([...raceMode.slice(0, index), raceModeType.Finish, ...raceMode.slice(index + 1)])
            } else {
                if (race.fleets[0]!.startTime != 0) {
                    // if the fleet has started, but no boat has finished it must be in lap mode
                    setRaceMode([...raceMode.slice(0, index), raceModeType.Lap, ...raceMode.slice(index + 1)])
                } else {
                    // if the fleet has not started, it must be in none (blank) mode
                    setRaceMode([...raceMode.slice(0, index), raceModeType.None, ...raceMode.slice(index + 1)])
                }
            }
        })
    }, [race])

    if (raceIsError || race == undefined || clubIsError || club == undefined || session == undefined || startSequenceIsError || startSequence == undefined) {
        return <PageSkeleton />
    }

    return (
        <>
            <RetireModal isOpen={retireModal} onSubmit={retireBoat} result={activeResult} onClose={() => setRetireModal(false)} />
            <FleetSelectDialog mode={selectMode} isOpen={fleetSelectModal} onSubmit={setFleetMode} onClose={() => setFleetSelectModal(false)} fleets={race.fleets} />
            <FlagModal isOpen={flagModal} currentFlagStatus={flagStatus} nextFlagStatus={nextFlagStatus} onClose={() => setFlagModal(false)} />
            <audio id='Beep' src='/Beep-6.mp3'></audio>
            <audio id='Countdown' src='/Countdown.mp3'></audio>
            <div className='w-full flex flex-col items-center justify-start panel-height'>
                <div className='flex w-full flex-col justify-around' key={JSON.stringify(raceState)}>
                    <div className='flex flex-row'>
                        <div className='w-1/4 p-2 m-2 border-4 rounded-lg  text-lg font-medium'>
                            Event: {race?.series?.name} - {race?.number}
                        </div>
                        <div className='w-1/4 p-2 m-2 border-4 rounded-lg text-lg font-medium'>
                            Race Time:
                            <RaceTimer
                                key={race.fleets.reduce((max, step) => (step.startTime > max ? step.startTime : max), 0)}
                                sequence={startSequence}
                                // start time is the max start time of all fleets, so that the timer starts at the latest start time.
                                startTime={race.fleets.reduce((max, step) => (step.startTime > max ? step.startTime : max), 0)}
                                onFlagChange={handleFlagChange}
                                onHoot={handleHoot}
                                timerActive={raceState == raceStateType.running}
                                reset={raceState == raceStateType.reset}
                                onSequenceEnd={handleSequenceEnd}
                                onWarning={handleWarning}
                                onFleetStart={handleFleetStart}
                            />
                        </div>
                        <div className='p-2 w-1/4' id='RaceStateButton'>
                            {(() => {
                                switch (raceState) {
                                    case raceStateType.reset:
                                        return (
                                            <Button onClick={() => startRaceButton()} size='big' variant={'green'}>
                                                Start
                                            </Button>
                                        )
                                    case raceStateType.running:
                                        return (
                                            <Button
                                                onClick={e => {
                                                    confirm('are you sure you want to stop the race?') ? stopRace() : null
                                                }}
                                                size='big'
                                                variant={'red'}
                                            >
                                                Stop
                                            </Button>
                                        )
                                    case raceStateType.stopped:
                                        return (
                                            <Button onClick={() => resetRace()} size='big' variant={'blue'}>
                                                Reset
                                            </Button>
                                        )
                                    case raceStateType.calculate:
                                        return (
                                            <Button id='CalcResultsButton' onClick={calculateResults} size='big' variant={'green'}>
                                                Calculate Results
                                            </Button>
                                        )
                                    case raceStateType.retire:
                                        return (
                                            <Button size='big' variant={'secondary'}>
                                                Retire Mode
                                            </Button>
                                        )
                                    default:
                                        return <p> unknown race state</p>
                                }
                            })()}
                        </div>
                    </div>
                </div>
                <div className='flex w-full shrink flex-row justify-around'>
                    <div className='w-1/5 p-2'>
                        <Button onClick={() => undo()} size='big' variant={'warning'}>
                            Undo Last Action
                        </Button>
                    </div>
                    <div className='w-1/5 p-2' id='RetireModeButton'>
                        {raceState == raceStateType.retire ? (
                            <Button onClick={() => setRaceState(lastRaceState)} size='big' variant={'blue'}>
                                Cancel Retirement
                            </Button>
                        ) : (
                            <Button
                                onClick={() => {
                                    setLastRaceState(raceState)
                                    setRaceState(raceStateType.retire)
                                }}
                                size='big'
                                variant={'blue'}
                            >
                                Retire a Boat
                            </Button>
                        )}
                    </div>
                    <div className='w-1/5 p-2' id='LapModeButton'>
                        <Button onClick={lapModeClick} size='big' variant={'blue'}>
                            Lap Mode
                        </Button>
                    </div>
                    <div className='w-1/5 p-2' id='FinishModeButton'>
                        <Button onClick={finishModeClick} size='big' variant={'blue'}>
                            Finish Mode
                        </Button>
                    </div>
                </div>
                <div className='overflow-auto'>
                    <div className='flex flex-row justify-around flex-wrap' id='EntrantCards'>
                        {race.fleets
                            .flatMap(fleets => fleets.results)
                            .map((result: ResultDataType, index) => {
                                let fleetIndex = race.fleets.findIndex(fleet => fleet.id == result.fleetId)
                                return (
                                    <BoatCard
                                        key={result.id}
                                        result={result}
                                        fleet={race.fleets.find(fleet => fleet.id == result.fleetId)!}
                                        pursuit={false}
                                        mode={raceMode[fleetIndex]!}
                                        raceState={raceState}
                                        lapBoat={lapBoat}
                                        finishBoat={finishBoat}
                                        showRetireModal={showRetireModal}
                                    />
                                )
                            })}
                    </div>
                </div>
            </div>
        </>
    )
}
