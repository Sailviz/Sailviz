import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import PursuitTimer from '@components/PRaceTimer'
import { PageSkeleton } from '@components/layout/PageSkeleton'
import PursuitTable from '@components/layout/race/PursuitTable'
import RetireModal from '@components/layout/dashboard/RetireModal'
import BoatCard from '@components/layout/race/BoatCard'
import FlagModal from '@components/layout/dashboard/Flag Modal'
import { Button } from '@components/ui/button'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import BackButton from '@components/layout/backButton'
import * as Types from '@sailviz/types'

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

//pursuit races don't work with fleets, why would you?
//race organisation if based off of the first fleet, all boats from any fleets are used.

function Page() {
    const { raceId } = Route.useParams()

    const navigate = useNavigate()

    const [flagStatus, setFlagStatus] = useState<boolean[]>([false, false])
    const [nextFlagStatus, setNextFlagStatus] = useState<boolean[]>([false, false])
    const [retireModal, setRetireModal] = useState(false)
    const [flagModal, setFlagModal] = useState(false)

    const startLength = 315 //5 mins 15 seconds in seconds

    var [seriesName, setSeriesName] = useState('')

    const queryClient = useQueryClient()

    const club = useQuery(orpcClient.organization.session.queryOptions()).data as Types.Org

    // Capture race query options for consistent queryKey usage in optimistic updates
    const raceQueryOptions = orpcClient.race.find.queryOptions({ input: { raceId: raceId }, results: true, boats: true })
    const race = useQuery(raceQueryOptions).data as Types.RaceType
    const series = useQuery(orpcClient.series.find.queryOptions({ input: { seriesId: race!.seriesId } })).data as Types.SeriesType

    const updateFleetMutation = useMutation(orpcClient.fleet.update.mutationOptions())
    const updateResultMutation = useMutation(orpcClient.result.update.mutationOptions())

    const findSeriesMutation = useMutation(orpcClient.series.find.mutationOptions())

    const createLapMutation = useMutation(orpcClient.lap.create.mutationOptions())

    const deleteLapMutation = useMutation(orpcClient.lap.delete.mutationOptions())

    var [raceState, setRaceState] = useState<raceStateType>(raceStateType.reset)
    const [lastRaceState, setLastRaceState] = useState<raceStateType>(raceStateType.reset)

    var [lastAction, setLastAction] = useState<{ type: string; resultId: string }>({ type: '', resultId: '' })

    const [activeResult, setActiveResult] = useState<Types.ResultType>({} as Types.ResultType)

    const [tableView, setTableView] = useState(false)

    const [firstLoad, setFirstLoad] = useState(true)

    const startRaceButton = async () => {
        let localTime = Math.floor(new Date().getTime() / 1000 + startLength)

        //start the timer
        fetch('https://' + club.metadata!.clockIP + '/set?startTime=' + (localTime - club.metadata!.clockOffset).toString(), {
            signal: controller.signal,
            mode: 'no-cors'
        }).catch(err => {
            console.log('clock not connected')
            console.log(err)
        })

        //Update database
        race.fleets.forEach(async fleet => {
            fleet.startTime = localTime
            await updateFleetMutation.mutateAsync(fleet)
        })
        setFlagModal(true)
        //set flag status to false
        setFlagStatus([false, false])
        setNextFlagStatus([true, false])

        queryClient.invalidateQueries({ queryKey: raceQueryOptions.queryKey })
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
        fetch('https://' + club.metadata!.hornIP + '/reset', {
            signal: controller.signal,
            headers: new Headers({ 'content-type': 'text/plain' })
        })
    }

    const handleFiveMinutes = () => {
        console.log('5 minutes left')
        setFlagStatus([true, false])
        setNextFlagStatus([true, true])

        //sound horn
        fetch('https://' + club.metadata!.hornIP + '/hoot?startTime=300', {
            signal: controller.signal,
            headers: new Headers({ 'content-type': 'text/plain' })
        }).catch(err => {
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
        fetch('https://' + club.metadata!.hornIP + '/hoot?startTime=300', {
            signal: controller.signal,
            headers: new Headers({ 'content-type': 'text/plain' })
        }).catch(err => {
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
        fetch('https://' + club.metadata!.hornIP + '/hoot?startTime=500', {
            signal: controller.signal,
            headers: new Headers({ 'content-type': 'text/plain' })
        }).catch(err => {
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
        setFlagModal(false)

        //sound horn
        fetch('https://' + club.metadata!.hornIP + '/hoot?startTime=300', {
            signal: controller.signal,
            headers: new Headers({ 'content-type': 'text/plain' })
        }).catch(err => {
            console.log('horn not connected')
            console.log(err)
        })

        let sound = document.getElementById('Beep') as HTMLAudioElement
        sound!.currentTime = 0
        sound!.play()

        setRaceState(raceStateType.running)
    }

    const stopRace = async () => {
        setRaceState(raceStateType.stopped)
        const timeoutId = setTimeout(() => controller.abort(), 2000)
        fetch('https://' + club.metadata!.clockIP + '/reset', { signal: controller.signal, mode: 'no-cors' })
            .then(_ => {
                clearTimeout(timeoutId)
            })
            .catch(function (err) {
                console.log('Clock not connected: ', err)
            })
    }

    const resetRace = async () => {
        const timeoutId = setTimeout(() => controller.abort(), 2000)
        fetch('https://' + club.metadata!.clockIP + '/reset', { signal: controller.signal, mode: 'no-cors' })
            .then(_ => {
                clearTimeout(timeoutId)
            })
            .catch(function (err) {
                console.log('Clock not connected: ', err)
            })
        //Update database
        race.fleets.forEach(fleet => {
            fleet.startTime = 0
            updateFleetMutation.mutateAsync(fleet)
        })

        setRaceState(raceStateType.reset)
    }

    const retireBoat = async (resultCode: string) => {
        let tempdata = activeResult
        tempdata.resultCode = resultCode
        tempdata.PursuitPosition = race.fleets[0]!.results!.length //move to end of pursuit order

        setLastAction({ type: 'retire', resultId: tempdata.id })

        setRetireModal(false)
        let optimisticData: Types.RaceType = window.structuredClone(race)
        //update optimistic data with new lap
        optimisticData.fleets.forEach((fleet: Types.FleetType) => {
            fleet.results!.forEach(res => {
                if (res.id == tempdata.id) {
                    res.resultCode = resultCode
                    res.PursuitPosition = race.fleets[0]!.results!.length //move to end of pursuit order
                }
            })
        })
        // Optimistic update via TanStack Query
        const previousRace = queryClient.getQueryData<Types.RaceType>(raceQueryOptions.queryKey)
        queryClient.setQueryData(raceQueryOptions.queryKey, optimisticData)
        try {
            await updateResultMutation.mutateAsync(tempdata)
        } catch (err) {
            if (previousRace) queryClient.setQueryData(raceQueryOptions.queryKey, previousRace)
            throw err
        } finally {
            queryClient.invalidateQueries({ queryKey: raceQueryOptions.queryKey })
        }

        let sound = document.getElementById('Beep') as HTMLAudioElement
        sound!.currentTime = 0
        sound!.play()
        dynamicSort(optimisticData)
        if (lastRaceState == raceStateType.calculate) {
            //if we were in calculate mode before retiring, we need to re adjust the pursuit positions
            // shift everyone up to close the gap
            optimisticData.fleets[0]!.results!.filter(res => res.resultCode == '')
                .sort((a, b) => a.PursuitPosition - b.PursuitPosition)
                .forEach(async (res, index) => {
                    res.PursuitPosition = index + 1
                    await updateResultMutation.mutateAsync(res)
                })

            // force mutate to reload data
            // Refresh race data after positional updates
            queryClient.invalidateQueries({ queryKey: raceQueryOptions.queryKey })
        }
        setRaceState(lastRaceState)
    }

    const moveUp = async (id: string) => {
        //move selected boat up and boat above it down
        let toMoveUp = race.fleets.flatMap(fleet => fleet.results!).find(result => result.id === id)
        let toMoveDown = race.fleets.flatMap(fleet => fleet.results!).find(result => result.PursuitPosition == toMoveUp!.PursuitPosition - 1)
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
        await Promise.all([updateResultMutation.mutateAsync(toMoveUp), updateResultMutation.mutateAsync(toMoveDown)])

        queryClient.invalidateQueries({
            queryKey: orpcClient.fleet.find.key({ type: 'query' })
        })
    }

    const moveDown = async (id: string) => {
        //move selected boat up and boat above it down
        let toMoveDown = race.fleets.flatMap(fleet => fleet.results!).find(result => result.id === id)
        let toMoveUp: Types.ResultType | undefined = race.fleets.flatMap(fleet => fleet.results!).find(result => result.PursuitPosition == toMoveDown!.PursuitPosition + 1)
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
        await Promise.all([updateResultMutation.mutateAsync(toMoveUp), updateResultMutation.mutateAsync(toMoveDown)])

        queryClient.invalidateQueries({
            queryKey: orpcClient.fleet.find.key({ type: 'query' })
        })
    }

    const dynamicSort = async (data: Types.RaceType) => {
        // there is just one fleet so grab the first one
        let start = race.fleets[0]!.startTime
        data.fleets[0]!.results!.sort((a: Types.ResultType, b: Types.ResultType) => {
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

        data.fleets[0]!.results!.forEach((res, index) => {
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
        let optimisticData: Types.RaceType = window.structuredClone(race)
        //update optimistic data with new lap
        optimisticData.fleets.forEach((fleet: Types.FleetType) => {
            fleet.results!.forEach(res => {
                if (res.id == resultId) {
                    res.laps.push({ resultId: resultId, time: time, id: '' })
                }
            })
        })

        // Optimistic update via TanStack Query
        const previousRace = queryClient.getQueryData<Types.RaceType>(raceQueryOptions.queryKey)
        queryClient.setQueryData(raceQueryOptions.queryKey, optimisticData)
        try {
            await createLapMutation.mutateAsync({ resultId: resultId, time: time })
        } catch (err) {
            if (previousRace) queryClient.setQueryData(raceQueryOptions.queryKey, previousRace)
            throw err
        } finally {
            queryClient.invalidateQueries({ queryKey: raceQueryOptions.queryKey })
        }

        let sound = document.getElementById('Beep') as HTMLAudioElement
        sound!.currentTime = 0
        sound!.play()
        dynamicSort(optimisticData)

        setLastAction({ type: 'lap', resultId: resultId })
    }

    const endRace = async () => {
        console.log('ending race')
        //sound horn
        fetch('http://' + club.metadata!.hornIP + '/hoot?startTime=300', {
            signal: controller.signal,
            mode: 'no-cors',
            headers: new Headers({ 'content-type': 'text/plain', 'Access-Control-Allow-Methods': 'POST' })
        }).catch(err => {
            console.log('horn not connected')
            console.log(err)
        })
        let sound = document.getElementById('Beep') as HTMLAudioElement
        sound!.currentTime = 0
        sound!.play()

        //set provisional positions

        race.fleets[0]!.results!.sort((a: Types.ResultType, b: Types.ResultType) => {
            // push retired to the bottom
            if (a.resultCode != '') {
                return 1
            }
            if (b.resultCode != '') {
                return -1
            }
            //sort by nubmer of laps then last lap time
            if (a.numberLaps != b.numberLaps) {
                return a.numberLaps - b.numberLaps
            } else {
                return a.laps.slice(-1)[0]!.time - b.laps.slice(-1)[0]!.time
            }
        })

        console.log(race.fleets[0]!.results)

        race.fleets[0]!.results!.forEach(async (res, index) => {
            if (res.resultCode != '') {
                console.log(res)
                res.PursuitPosition = race.fleets[0]!.results!.length
            } else {
                res.PursuitPosition = index + 1
            }
            console.log(res.SailNumber + ' ' + res.PursuitPosition)
            await updateResultMutation.mutateAsync(res)
        })

        await queryClient.invalidateQueries({ queryKey: raceQueryOptions.queryKey })

        setRaceState(raceStateType.calculate)
        setTableView(true)
    }

    const submitResults = async () => {
        //copy lap data into final result
        race.fleets
            .flatMap(fleet => fleet.results!)
            .forEach(async result => {
                if (result.numberLaps == 0) {
                    result.numberLaps = result.laps.length
                }
                await updateResultMutation.mutateAsync(result)
            })
        navigate({ to: '/Race/' + race.id })
    }

    const showRetireModal = (resultId: string) => {
        setRetireModal(true)
        let result: Types.ResultType | undefined
        race.fleets.some(fleet => {
            result = fleet.results!.find(result => result.id === resultId)
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

        let actionResult = race.fleets.flatMap(fleet => fleet.results!).find(result => result.id === lastAction.resultId)
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
            await deleteLapMutation.mutateAsync({ lapId: lapId })
        } else if (lastAction.type == 'retire') {
            actionResult.resultCode = ''
            await updateResultMutation.mutateAsync(actionResult)
        }

        queryClient.invalidateQueries({ queryKey: raceQueryOptions.queryKey })
    }

    const controller = new AbortController()

    useEffect(() => {
        const loadRace = async () => {
            //check state of race and set ui accordingly
            console.log(race)
            if (race.fleets[0]!.startTime == 0) {
                setRaceState(raceStateType.reset)
            } else if (race.fleets[0]!.startTime + club.metadata!.pursuitLength * 60 < Math.floor(new Date().getTime() / 1000)) {
                setRaceState(raceStateType.calculate)
                setTableView(true)
            } else {
                setRaceState(raceStateType.running)
            }

            if (seriesName == '') {
                setSeriesName(
                    await findSeriesMutation.mutateAsync({ seriesId: race.seriesId }).then(res => {
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
        <div className='flex flex-col h-full overflow-hidden'>
            <nav className='py-2.5 border-b-2 flex h-16'>
                <div className='container flex flex-wrap justify-start items-start'>
                    <div className='px-3'>
                        <BackButton route={'/dashboard/Race/' + raceId} />
                    </div>
                    <div className=' text-4xl font-bold px-1 cursor-pointer'>SailViz </div>
                </div>
            </nav>
            <main className='flex items-stretch w-full h-full'>
                <RetireModal isOpen={retireModal} onSubmit={retireBoat} result={activeResult} onClose={() => setRetireModal(false)} />

                <FlagModal isOpen={flagModal} currentFlagStatus={flagStatus} nextFlagStatus={nextFlagStatus} onClose={() => setFlagModal(false)} />

                <audio id='Beep' src='/Beep-6.mp3'></audio>
                <audio id='Countdown' src='/Countdown.mp3'></audio>
                <div className='w-full flex flex-col items-center justify-start panel-height overflow-auto'>
                    <div className='flex w-full flex-row justify-around'>
                        <div className='w-1/4 p-2 m-2 border-4 rounded-lg  text-lg font-medium'>
                            Event: {seriesName} - {race.number}
                        </div>
                        {race.fleets.length < 1 ? (
                            <p>Waiting for boats to be added to fleets</p>
                        ) : (
                            <div className='w-1/4 p-2 m-2 border-4 rounded-lg text-lg font-medium'>
                                Race Time:{' '}
                                <PursuitTimer
                                    startTime={race.fleets[0]!.startTime}
                                    endTime={series?.settings.pursuitLength}
                                    timerActive={raceState == raceStateType.running}
                                    onFiveMinutes={handleFiveMinutes}
                                    onFourMinutes={handleFourMinutes}
                                    onOneMinute={handleOneMinute}
                                    onGo={handleGo}
                                    onEnd={endRace}
                                    onWarning={handleWarning}
                                    reset={raceState == raceStateType.reset}
                                />
                            </div>
                        )}
                        <div className='w-1/4 p-2 m-2 border-4 rounded-lg text-lg font-medium'>Actual Time: {time}</div>
                        <div className='p-2 w-1/4'>
                            {(() => {
                                switch (raceState) {
                                    case raceStateType.reset:
                                        return (
                                            <p
                                                onClick={startRaceButton}
                                                className='cursor-pointer text-white bg-green-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center'
                                            >
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
                                            <p
                                                onClick={submitResults}
                                                className='cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center'
                                            >
                                                Submit Results
                                            </p>
                                        )
                                    case raceStateType.retire:
                                        return (
                                            <p className='text-white bg-yellow-400 font-medium rounded-lg text-xl px-5 py-2.5 text-center'>
                                                Retiring Boat - Select Boat to Retire
                                            </p>
                                        )
                                    default: //countdown and starting and allStarted
                                        return (
                                            <p
                                                onClick={_ => {
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
                    </div>
                    {tableView ? (
                        <PursuitTable fleetId={race.fleets[0]!.id} raceState={raceState} moveUp={moveUp} moveDown={moveDown} showRetireModal={showRetireModal} />
                    ) : (
                        <div className='overflow-auto'>
                            <div className='flex flex-row justify-around flex-wrap' id='EntrantCards'>
                                {race.fleets
                                    .flatMap(fleets => fleets.results!)
                                    .map((result: Types.ResultType) => {
                                        return (
                                            <BoatCard
                                                key={result.id}
                                                result={result}
                                                fleet={race.fleets.find(fleet => fleet.id == result.fleetId)!}
                                                pursuit={true}
                                                mode={raceModeType.Lap} // always lap mode for pursuit
                                                raceState={raceState}
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
            </main>
        </div>
    )
}

export const Route = createFileRoute('/PRace/$raceId')({
    component: Page
})
