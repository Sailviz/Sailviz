import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useEffect, useRef, useState } from 'react'

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

const secondsToTimeString = (seconds: number) => {
    let minutes = Math.floor(seconds / 60)
    let remainder = seconds % 60
    return minutes.toString().padStart(2, '0') + ':' + remainder.toString().padStart(2, '0')
}

export default function BoatCard({
    result,
    fleet,
    pursuit,
    mode,
    raceState,
    lapBoat,
    finishBoat,
    showRetireModal
}: {
    result: ResultDataType
    fleet: FleetDataType
    pursuit: boolean
    mode: raceModeType
    raceState: raceStateType
    lapBoat: (id: string) => void
    finishBoat: (id: string) => void
    showRetireModal: (id: string) => void
}) {
    const [isDisabled, setIsDisabled] = useState(false)

    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        setIsDisabled(timeoutRef.current != null)
    }, [result])

    if (result.resultCode != '') {
        //result has a result code so we display it
        let text = result.resultCode
        return (
            <div id={result.id} className='flex bg-red-300 flex-row justify-between p-6 m-4 border-2 border-pink-500 rounded-lg shadow-xl w-96 shrink-0'>
                <div className='flex flex-col'>
                    <h2 className='text-2xl text-gray-700'>{result.SailNumber}</h2>
                    <h2 className='text-2xl text-gray-700'>{result.boat?.name}</h2>
                    <p className='text-base text-gray-600'>
                        {result.Helm} - {result.Crew}
                    </p>
                </div>
                <Button color='danger' disabled={true} className=' w-36 m-6 h-4/6 text-xl'>
                    {text}
                </Button>
            </div>
        )
    } else if (result.finishTime == 0) {
        //result has not finished
        return (
            <div id={result.id} className='flex bg-green-300 flex-row justify-between m-4 border-2 border-pink-500 rounded-lg shadow-xl w-96 shrink-0'>
                <div className='flex flex-col ml-4 my-6'>
                    <h2 className='text-2xl text-gray-700'>{result.SailNumber}</h2>
                    <h2 className='text-2xl text-gray-700'>{result.boat?.name}</h2>
                    <p className='text-base text-gray-600'>
                        {result.Helm} - {result.Crew}
                    </p>
                    {result.laps.length >= 1 ? (
                        <p className='text-base text-gray-600'>
                            Laps: {result.laps.length} Last: {secondsToTimeString(result.laps[result.laps.length - 1]?.time! - fleet.startTime)}
                        </p>
                    ) : (
                        <>
                            {pursuit ? (
                                <p className='text-base text-gray-600'>
                                    start Time: {result.boat.pursuitStartTime < 0 ? '-' : '+'}
                                    {new Date(Math.abs(result.boat.pursuitStartTime || 0) * 1000).toISOString().substr(14, 5)}
                                </p>
                            ) : (
                                <p className='text-base text-gray-600'>Laps: {result.laps.length} </p>
                            )}
                        </>
                    )}
                </div>
                {isDisabled ? (
                    <Button variant={'outline'} className=' w-36 m-6 h-4/6 text-xl'>
                        <Spinner />
                    </Button>
                ) : (
                    <>
                        {(() => {
                            if (raceState == raceStateType.retire) {
                                return (
                                    <Button
                                        variant={'blue'}
                                        className=' w-36 m-6 h-4/6 text-xl'
                                        onClick={e => {
                                            setIsDisabled(true)
                                            timeoutRef.current = setTimeout(() => {
                                                setIsDisabled(false)
                                                timeoutRef.current = null
                                            }, 15000)
                                            showRetireModal(result.id)
                                        }}
                                    >
                                        Retire
                                    </Button>
                                )
                            }
                            switch (mode) {
                                case raceModeType.Finish:
                                    return (
                                        <Button
                                            variant={'blue'}
                                            className=' w-36 m-6 h-4/6 text-xl'
                                            onClick={e => {
                                                setIsDisabled(true)
                                                timeoutRef.current = setTimeout(() => {
                                                    setIsDisabled(false)
                                                    timeoutRef.current = null
                                                }, 15000)
                                                finishBoat(result.id)
                                            }}
                                        >
                                            Finish
                                        </Button>
                                    )
                                case raceModeType.Lap:
                                    return (
                                        <Button
                                            variant={'blue'}
                                            className=' w-36 m-6 h-4/6 text-xl'
                                            onClick={e => {
                                                setIsDisabled(true)
                                                timeoutRef.current = setTimeout(() => {
                                                    setIsDisabled(false)
                                                    timeoutRef.current = null
                                                }, 15000)
                                                lapBoat(result.id)
                                            }}
                                        >
                                            Lap
                                        </Button>
                                    )
                            }
                        })()}
                    </>
                )}
            </div>
        )
    } else {
        //result has finished
        return (
            <div id={result.id} className='flex bg-red-300 flex-row justify-between p-6 m-4 border-2 border-pink-500 rounded-lg shadow-xl w-96 shrink-0'>
                <div className='flex flex-col'>
                    <h2 className='text-2xl text-gray-700'>{result.SailNumber}</h2>
                    <h2 className='text-2xl text-gray-700'>{result.boat?.name}</h2>
                    <p className='text-base text-gray-600'>
                        {result.Helm} - {result.Crew}
                    </p>
                    <p className='text-base text-gray-600'>
                        Laps: {result.laps.length} Finish: {secondsToTimeString(result.finishTime - fleet.startTime)}
                    </p>
                </div>
                <Button variant={'blue'} className=' w-36 m-6 h-4/6 text-xl'>
                    Finished
                </Button>
            </div>
        )
    }
}
