import { Button } from '@nextui-org/react'
import { useEffect, useRef, useState } from 'react'

enum raceStateType {
    countdown,
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
    lapBoat,
    finishBoat,
    showRetireModal
}: {
    result: ResultsDataType
    fleet: FleetDataType
    pursuit: boolean
    mode: modeType
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
                <Button color='danger' isDisabled={true} className=' w-36 m-6 h-4/6 text-xl'>
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
                    <Button isLoading={true} color='default' className=' w-36 m-6 h-4/6 text-xl'></Button>
                ) : (
                    <>
                        {(() => {
                            switch (mode) {
                                case modeType.Finish:
                                    return (
                                        <Button
                                            color='primary'
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
                                case modeType.Retire:
                                    return (
                                        <Button
                                            color='primary'
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
                                case modeType.Lap:
                                    return (
                                        <Button
                                            color='primary'
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
                <Button color='primary' className=' w-36 m-6 h-4/6 text-xl'>
                    Finished
                </Button>
            </div>
        )
    }
}
