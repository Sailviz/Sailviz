import { useEffect, useState } from 'react'

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

const secondsToTimeString = (seconds: number) => {
    let minutes = Math.floor(seconds / 60)
    let remainder = seconds % 60
    return minutes.toString().padStart(2, '0') + ':' + remainder.toString().padStart(2, '0')
}

export default function PursuitCard({
    result,
    raceState,
    lapBoat,
    showRetireModal
}: {
    result: ResultDataType
    raceState: raceStateType
    lapBoat: (id: string) => void
    showRetireModal: (id: string) => void
}) {
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setIsLoading(false)
    }, [result])

    if (result.resultCode != '') {
        return (
            <div id={result.id} className={'bg-red-300 border-2 border-pink-500'}>
                <div className='flex flex-row m-4 justify-between'>
                    <h2 className='text-2xl text-gray-700 flex my-auto mr-5'>
                        {result.SailNumber} - {result.boat?.name} : {result.Helm} - {result.Crew} -
                    </h2>
                    <div className='flex'>
                        <h2 className='text-2xl text-gray-700 flex my-auto mr-5'>{result.resultCode} </h2>
                    </div>
                </div>
            </div>
        )
    } else if (raceState == raceStateType.running) {
        return (
            <div>
                <div id={result.id} className={'bg-green-300 border-2 border-pink-500'}>
                    <div className='flex flex-row m-4 justify-between'>
                        <h2 className='text-2xl text-gray-700 flex my-auto mr-5'>
                            {result.SailNumber} - {result.boat?.name} : {result.Helm} - {result.Crew} -
                        </h2>
                        <div className='flex'>
                            <p
                                onClick={e => {
                                    confirm('are you sure you want to retire ' + result.SailNumber) ? showRetireModal(result.id) : null
                                }}
                                className='cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-sm p-5 mx-2 ml-auto text-center flex'
                            >
                                Retire
                            </p>
                            <h2 className='text-2xl text-gray-700 flex my-auto mr-5'>
                                Laps: {result.laps.length} Position: {result.PursuitPosition}{' '}
                            </h2>
                            <h2 className='text-2xl text-gray-700 flex my-auto mr-5'>
                                {' '}
                                Start Time: {String(Math.floor((result.boat?.pursuitStartTime || 0) / 60)).padStart(2, '0')}:
                                {String((result.boat?.pursuitStartTime || 0) % 60).padStart(2, '0')}
                            </h2>
                            <p onClick={() => lapBoat(result.id)} className='cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-sm p-5 mx-2 text-center flex'>
                                lap
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    } else {
        return (
            <div>
                <div id={result.id} className={'bg-green-300 border-2 border-pink-500'}>
                    <div className='flex flex-row m-4 justify-between'>
                        <h2 className='text-2xl text-gray-700 flex my-auto mr-5'>
                            {result.SailNumber} - {result.boat?.name} : {result.Helm} - {result.Crew} -
                        </h2>
                        <h2 className='text-2xl text-gray-700 flex my-auto mr-5'>
                            Laps: {result.laps.length} Position: {result.PursuitPosition}{' '}
                        </h2>
                        <h2 className='text-2xl text-gray-700 flex my-auto mr-5'>
                            {' '}
                            Start Time: {String(Math.floor((result.boat?.pursuitStartTime || 0) / 60)).padStart(2, '0')}:
                            {String((result.boat?.pursuitStartTime || 0) % 60).padStart(2, '0')}
                        </h2>
                    </div>
                </div>
            </div>
        )
    }
}
