'use client'
import React, { ChangeEvent, MouseEventHandler, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import PursuitTimer from '@/components/PRaceTimer'

import * as Fetcher from '@/components/Fetchers'
import { mutate } from 'swr'
import { PageSkeleton } from '@/components/layout/PageSkeleton'
import PursuitTable from '@/components/layout/race/PursuitTable'
import RetireModal from '@/components/layout/dashboard/RetireModal'
import BoatCard from '@/components/layout/race/BoatCard'
import { result, set } from 'cypress/types/lodash'
import { use } from 'chai'
import FlagModal from '@/components/layout/dashboard/Flag Modal'
import { useSession, signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'

enum raceStateType {
    running,
    stopped,
    reset,
    calculate
}

enum modeType {
    Retire,
    Lap,
    NotStarted,
    Finish
}

//pursuit races don't work with fleets, why would you?
//race organisation if based off of the first fleet, all boats from any fleets are used.

type PageProps = { params: Promise<{ slug: string }> }

export default async function Page(props: PageProps) {
    const Router = useRouter()

    const params = await props.params

    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            signIn()
        }
    })

    // const retireModal = useDisclosure()
    // const flagModal = useDisclosure()
    const [flagStatus, setFlagStatus] = useState<boolean[]>([false, false])
    const [nextFlagStatus, setNextFlagStatus] = useState<boolean[]>([false, false])

    const startLength = 315 //5 mins 15 seconds in seconds

    var [seriesName, setSeriesName] = useState('')

    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { race, raceIsError, raceIsValidating, mutateRace } = Fetcher.Race(params.slug, true)

    var [raceState, setRaceState] = useState<raceStateType>(raceStateType.reset)
    const [mode, setMode] = useState(modeType.NotStarted)

    var [lastAction, setLastAction] = useState<{ type: string; resultId: string }>({ type: '', resultId: '' })

    const [activeResult, setActiveResult] = useState<ResultsDataType>({} as ResultsDataType)

    const [tableView, setTableView] = useState(false)

    const [firstLoad, setFirstLoad] = useState(true)

    const startRaceButton = async () => {
        let localTime = Math.floor(new Date().getTime() / 1000 + startLength)

        //start the timer
        fetch('https://' + club.settings.clockIP + '/set?startTime=' + (localTime - club.settings.clockOffset).toString(), {
            signal: controller.signal,
            mode: 'no-cors'
        }).catch(err => {
            console.log('clock not connected')
            console.log(err)
        })

        //Update database
        race.fleets.forEach(async fleet => {
            fleet.startTime = localTime
            await DB.updateFleetById(fleet)
        })
        // flagModal.onOpen()
        //set flag status to false
        setFlagStatus([false, false])
        setNextFlagStatus([true, false])

        mutateRace()
        startRace()
    }

    const startRace = async () => {
        setRaceState(raceStateType.running)
        //start countdown timer

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

    const handleFiveMinutes = () => {
        console.log('5 minutes left')
        setFlagStatus([true, false])
        setNextFlagStatus([true, true])

        //sound horn
        fetch('https://' + club.settings.hornIP + '/hoot?startTime=300', {
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
    const handleFourMinutes = () => {
        console.log('4 minutes left')
        setFlagStatus([true, true])
        setNextFlagStatus([true, false])

        //sound horn
        fetch('https://' + club.settings.hornIP + '/hoot?startTime=300', {
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

    const handleOneMinute = () => {
        console.log('1 minute left')
        setFlagStatus([true, false])
        setNextFlagStatus([false, false])

        //sound horn
        fetch('https://' + club.settings.hornIP + '/hoot?startTime=500', {
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

    const handleGo = () => {
        console.log('GO!')
        setFlagStatus([false, false])
        setNextFlagStatus([false, false])
        // flagModal.onClose()

        //sound horn
        fetch('https://' + club.settings.hornIP + '/hoot?startTime=300', {
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

        setMode(modeType.Lap)
    }

    const stopRace = async () => {
        setRaceState(raceStateType.stopped)
        const timeoutId = setTimeout(() => controller.abort(), 2000)
        fetch('https://' + club.settings.clockIP + '/reset', { signal: controller.signal, mode: 'no-cors' })
            .then(response => {
                clearTimeout(timeoutId)
            })
            .catch(function (err) {
                console.log('Clock not connected: ', err)
            })
    }

    const resetRace = async () => {
        const timeoutId = setTimeout(() => controller.abort(), 2000)
        fetch('https://' + club.settings.clockIP + '/reset', { signal: controller.signal, mode: 'no-cors' })
            .then(response => {
                clearTimeout(timeoutId)
            })
            .catch(function (err) {
                console.log('Clock not connected: ', err)
            })
        //Update database
        race.fleets.forEach(fleet => {
            fleet.startTime = 0
            DB.updateFleetById(fleet)
        })

        setRaceState(raceStateType.reset)
    }

    const retireBoat = async (resultCode: string) => {
        let tempdata = activeResult
        tempdata.resultCode = resultCode

        setLastAction({ type: 'retire', resultId: tempdata.id })

        // retireModal.onClose()
        let optimisticData: RaceDataType = window.structuredClone(race)
        //update optimistic data with new lap
        optimisticData.fleets.forEach((fleet: FleetDataType) => {
            fleet.results.forEach(res => {
                if (res.id == tempdata.id) {
                    res.resultCode = resultCode
                }
            })
        })
        //mutate race
        mutate(
            `/api/GetRaceById?id=${race.id}&results=true`,
            async update => {
                await DB.updateResult(tempdata)
                return await DB.getRaceById(race.id, true)
            },
            { optimisticData: optimisticData, rollbackOnError: false, revalidate: false }
        )

        let sound = document.getElementById('Beep') as HTMLAudioElement
        sound!.currentTime = 0
        sound!.play()
        dynamicSort(optimisticData)

        //set mode back to lap

        setMode(modeType.Lap)
    }

    const moveUp = async (id: string) => {
        //move selected boat up and boat above it down
        let toMoveUp = race.fleets.flatMap(fleet => fleet.results).find(result => result.id === id)
        let toMoveDown = race.fleets.flatMap(fleet => fleet.results).find(result => result.PursuitPosition == toMoveUp!.PursuitPosition - 1)
        if (toMoveDown == undefined) {
            console.error('no boat to move down')
            return
        }
        if (toMoveUp == undefined) {
            console.error('no boat to move up')
            return
        }

        toMoveUp.PursuitPosition = toMoveUp.PursuitPosition - 1
        toMoveDown.PursuitPosition = toMoveDown.PursuitPosition + 1

        //wait for both to be updated
        await Promise.all([DB.updateResult(toMoveUp), DB.updateResult(toMoveDown)])

        await mutate(`/api/GetFleetById?id=${race.fleets[0]!.id}`)
    }

    const moveDown = async (id: string) => {
        //move selected boat up and boat above it down
        let toMoveDown = race.fleets.flatMap(fleet => fleet.results).find(result => result.id === id)
        let toMoveUp: ResultsDataType | undefined = race.fleets.flatMap(fleet => fleet.results).find(result => result.PursuitPosition == toMoveDown!.PursuitPosition + 1)
        if (toMoveDown == undefined) {
            console.error('no boat to move down')
            return
        }
        if (toMoveUp == undefined) {
            console.error('no boat to move up')
            return
        }

        toMoveUp.PursuitPosition = toMoveUp.PursuitPosition - 1
        toMoveDown.PursuitPosition = toMoveDown.PursuitPosition + 1

        //wait for both to be updated
        await Promise.all([DB.updateResult(toMoveUp), DB.updateResult(toMoveDown)])

        await mutate(`/api/GetFleetById?id=${race.fleets[0]!.id}`)
    }

    const dynamicSort = async (data: RaceDataType) => {
        // there is just one fleet so grab the first one
        let start = race.fleets[0]!.startTime
        data.fleets[0]!.results.sort((a: ResultsDataType, b: ResultsDataType) => {
            //if done a lap, predicted is sum of lap times + last lap.
            //if no lap done, predicted is py.
            let aPredicted =
                a.laps.length > 0 ? a.laps[a.laps.length - 1]!.time + a.laps[a.laps.length - 1]!.time - (a.laps[a.laps.length - 2]?.time || start) : a.boat.pursuitStartTime
            let bPredicted =
                b.laps.length > 0 ? b.laps[b.laps.length - 1]!.time + b.laps[b.laps.length - 1]!.time - (b.laps[b.laps.length - 2]?.time || start) : b.boat.pursuitStartTime
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

        data.fleets[0]!.results.forEach((res, index) => {
            const element = document.getElementById(res.id)
            //loop until we find an element that exists

            if (element) {
                element.style.order = index.toString()
            }
        })
    }

    const lapBoat = async (resultId: string) => {
        let time = Math.floor(new Date().getTime() / 1000)
        //load back race data
        let optimisticData: RaceDataType = window.structuredClone(race)
        //update optimistic data with new lap
        optimisticData.fleets.forEach((fleet: FleetDataType) => {
            fleet.results.forEach(res => {
                if (res.id == resultId) {
                    res.laps.push({ resultId: resultId, time: time, id: '' })
                }
            })
        })

        //mutate race
        mutate(
            `/api/GetRaceById?id=${race.id}&results=true`,
            async update => {
                await DB.CreateLap(resultId, time)
                return await DB.getRaceById(race.id, true)
            },
            { optimisticData: optimisticData, rollbackOnError: false, revalidate: false }
        )

        let sound = document.getElementById('Beep') as HTMLAudioElement
        sound!.currentTime = 0
        sound!.play()
        dynamicSort(optimisticData)

        setLastAction({ type: 'lap', resultId: resultId })
    }

    const endRace = async () => {
        console.log('ending race')
        //sound horn
        fetch('http://' + club.settings.hornIP + '/hoot?startTime=300', {
            signal: controller.signal,
            mode: 'no-cors',
            headers: new Headers({ 'content-type': 'text/plain', 'Access-Control-Allow-Methods': 'POST' })
        })
            .then(response => {})
            .catch(err => {
                console.log('horn not connected')
                console.log(err)
            })
        let sound = document.getElementById('Beep') as HTMLAudioElement
        sound!.currentTime = 0
        sound!.play()

        //set provisional positions

        race.fleets[0]!.results.sort((a: ResultsDataType, b: ResultsDataType) => {
            //sort by nubmer of laps then last lap time
            if (a.numberLaps != b.numberLaps) {
                return b.numberLaps - a.numberLaps
            } else {
                return a.laps.slice(-1)[0]!.time - b.laps.slice(-1)[0]!.time
            }
        })

        console.log(race.fleets[0]!.results)

        race.fleets[0]!.results.forEach(async (res, index) => {
            res.PursuitPosition = index + 1
            console.log(res.SailNumber + ' ' + res.PursuitPosition)
            await DB.updateResult(res)
        })

        await mutateRace()

        setRaceState(raceStateType.calculate)
        setTableView(true)
    }

    const submitResults = async () => {
        //copy lap data into final result
        race.fleets
            .flatMap(fleet => fleet.results)
            .forEach(async result => {
                if (result.numberLaps == 0) {
                    result.numberLaps = result.laps.length
                }
                await DB.updateResult(result)
            })
        Router.push('/Race/' + race.id)
    }

    const ontimeupdate = async (time: { minutes: number; seconds: number; countingUp: boolean }) => {
        //to catch race being finished on page load
        if (time.minutes > club.settings.pursuitLength && time.countingUp == true) {
            setRaceState(raceStateType.calculate)
        }
    }

    const showRetireModal = (resultId: String) => {
        // retireModal.onOpen()
        let result: ResultsDataType | undefined
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
        } else if (lastAction.type == 'retire') {
            actionResult.resultCode = ''
            await DB.updateResult(actionResult)
        }

        mutateRace()
    }

    const controller = new AbortController()

    useEffect(() => {
        const loadRace = async () => {
            //check state of race and set ui accordingly
            if (race.fleets[0]!.startTime == 0) {
                setRaceState(raceStateType.reset)
            } else if (race.fleets[0]!.startTime + club.settings.pursuitLength * 60 < Math.floor(new Date().getTime() / 1000)) {
                setRaceState(raceStateType.calculate)
                setTableView(true)
            } else {
                setRaceState(raceStateType.running)
                setMode(modeType.Lap)
            }

            if (seriesName == '') {
                setSeriesName(
                    await DB.GetSeriesById(race.seriesId).then(res => {
                        return res.name
                    })
                )
            }
        }
        if (race != undefined && firstLoad) {
            loadRace()
            dynamicSort(race)
            setFirstLoad(false)
        }
    }, [race])

    const [time, setTime] = useState('')

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date().toTimeString().split(' ')[0]!), 1000)
        return () => {
            clearInterval(interval)
        }
    }, [])

    if (race == undefined) {
        return <PageSkeleton />
    }

    return (
        <>
            {/* <RetireModal isOpen={retireModal.isOpen} onSubmit={retireBoat} onClose={retireModal.onClose} result={activeResult} /> */}
            {/* <FlagModal isOpen={flagModal.isOpen} currentFlagStatus={flagStatus} nextFlagStatus={nextFlagStatus} onClose={flagModal.onClose} onSubmit={() => null} /> */}

            <audio id='Beep' src='/Beep-6.mp3'></audio>
            <audio id='Countdown' src='/Countdown.mp3'></audio>
            <div className='w-full flex flex-col items-center justify-start panel-height overflow-auto'>
                <div className='flex w-full flex-row justify-around'>
                    <div className='w-1/4 p-2 m-2 border-4 rounded-lg bg-white text-lg font-medium'>
                        Event: {seriesName} - {race.number}
                    </div>
                    {race.fleets.length < 1 ? (
                        <p>Waiting for boats to be added to fleets</p>
                    ) : (
                        <div className='w-1/4 p-2 m-2 border-4 rounded-lg bg-white text-lg font-medium'>
                            Race Time:{' '}
                            <PursuitTimer
                                startTime={race.fleets[0]!.startTime}
                                endTime={club?.settings.pursuitLength}
                                timerActive={raceState == raceStateType.running}
                                onFiveMinutes={handleFiveMinutes}
                                onFourMinutes={handleFourMinutes}
                                onOneMinute={handleOneMinute}
                                onGo={handleGo}
                                onEnd={endRace}
                                onTimeUpdate={ontimeupdate}
                                onWarning={handleWarning}
                                reset={raceState == raceStateType.reset}
                            />
                        </div>
                    )}
                    <div className='w-1/4 p-2 m-2 border-4 rounded-lg bg-white text-lg font-medium'>Actual Time: {time}</div>
                    <div className='p-2 w-1/4'>
                        {(() => {
                            switch (raceState) {
                                case raceStateType.reset:
                                    return (
                                        <p onClick={startRaceButton} className='cursor-pointer text-white bg-green-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center'>
                                            Start
                                        </p>
                                    )
                                case raceStateType.stopped:
                                    return (
                                        <p onClick={resetRace} className='cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center'>
                                            Reset
                                        </p>
                                    )
                                case raceStateType.calculate:
                                    return (
                                        <p onClick={submitResults} className='cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center'>
                                            Submit Results
                                        </p>
                                    )
                                default: //countdown and starting and allStarted
                                    return (
                                        <p
                                            onClick={e => {
                                                confirm('are you sure you want to stop the race?') ? stopRace() : null
                                            }}
                                            className='cursor-pointer text-white bg-red-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center'
                                        >
                                            Stop
                                        </p>
                                    )
                            }
                        })()}
                    </div>
                </div>
                <div className='flex w-full shrink flex-row justify-left'>
                    <div className='w-1/5 p-2'>
                        <Button onClick={() => undo()} size='lg' color='warning'>
                            Undo Last Action
                        </Button>
                    </div>
                    <div className='w-1/5 p-2' id='RetireModeButton'>
                        {mode == modeType.Retire ? (
                            <Button onClick={() => setMode(modeType.Lap)} size='lg' color={'primary'}>
                                Cancel Retirement
                            </Button>
                        ) : (
                            <Button onClick={() => setMode(modeType.Retire)} size='lg' color={'primary'}>
                                Retire a Boat
                            </Button>
                        )}
                    </div>
                </div>
                {tableView ? (
                    <PursuitTable
                        fleetId={race.fleets[0]!.id}
                        raceState={raceState}
                        raceMode={mode}
                        moveUp={moveUp}
                        moveDown={moveDown}
                        lapBoat={lapBoat}
                        showRetireModal={showRetireModal}
                    />
                ) : (
                    <div className='overflow-auto'>
                        <div className='flex flex-row justify-around flex-wrap' id='EntrantCards'>
                            {race.fleets
                                .flatMap(fleets => fleets.results)
                                .map((result: ResultsDataType, index) => {
                                    let fleetIndex = race.fleets.findIndex(fleet => fleet.id == result.fleetId)
                                    return (
                                        <BoatCard
                                            key={result.id}
                                            result={result}
                                            fleet={race.fleets.find(fleet => fleet.id == result.fleetId)!}
                                            pursuit={true}
                                            mode={mode}
                                            lapBoat={lapBoat}
                                            finishBoat={() => null}
                                            showRetireModal={showRetireModal}
                                        />
                                    )
                                })}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
