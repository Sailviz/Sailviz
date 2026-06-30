import { Dialog, DialogContent, DialogHeader } from '@components/ui/dialog'
import { orpcClient } from '@lib/orpc'
import * as Types from '@sailviz/types'
import { useQuery } from '@tanstack/react-query'

export default function FlagDialog({
    isOpen,
    currentFlagStatus,
    nextFlagStatus,
    fleetTime,
    countdownFleet,
    onClose
}: {
    isOpen: boolean
    currentFlagStatus: FlagStatusType[]
    nextFlagStatus: FlagStatusType[]
    fleetTime: number
    countdownFleet: Types.FleetType | null
    onClose: () => void
}) {
    const currentClassFlagUrlQuery = useQuery({
        ...orpcClient.image.getURL.queryOptions({ input: { s3key: currentFlagStatus[0]?.flag.s3key }, enabled: currentFlagStatus[1] !== undefined })
    })

    const currentPrepFlagUrlQuery = useQuery({
        ...orpcClient.image.getURL.queryOptions({ input: { s3key: currentFlagStatus[1]?.flag.s3key }, enabled: currentFlagStatus[1] !== undefined })
    })

    const nextClassFlagUrlQuery = useQuery({
        ...orpcClient.image.getURL.queryOptions({ input: { s3key: nextFlagStatus[0]?.flag.s3key }, enabled: nextFlagStatus[0] !== undefined })
    })

    const nextPrepFlagUrlQuery = useQuery({
        ...orpcClient.image.getURL.queryOptions({ input: { s3key: nextFlagStatus[1]?.flag.s3key }, enabled: nextFlagStatus[1] !== undefined })
    })

    return (
        <Dialog
            open={isOpen}
            onOpenChange={open => {
                if (!open) onClose() // this catches the x button and clicking outside the modal, gets out of parallel route
            }}
        >
            <DialogContent>
                <DialogHeader className='flex flex-col'></DialogHeader>
                <h1 className='text-center'>
                    <>{countdownFleet?.fleetSettings.name}</>
                </h1>

                <h1 className='text-center'>
                    <>
                        {Math.floor(fleetTime / 60)
                            .toString()
                            .padStart(2, '00')}
                        :
                        {Math.floor(fleetTime % 60) // Ensure seconds are rounded up, looks nicer
                            .toString()
                            .padStart(2, '00')}
                    </>
                </h1>
                <div className='flex flex-row w-full justify-around'>
                    <div className='text-2xl font-bold'>Current</div>
                    <div className='text-2xl font-bold'>Next</div>
                </div>

                <div className='flex flex-row w-full h-full divide-dashed'>
                    <div className='flex w-full flex-row h-full justify-evenly'>
                        {currentFlagStatus[0]?.status ? (
                            <div className='h-full flex flex-col justify-start'>
                                {currentClassFlagUrlQuery.data && <img src={currentClassFlagUrlQuery.data} alt='' width={200} height={200} className='border-2'></img>}
                            </div>
                        ) : (
                            <div className='h-full flex flex-col justify-end'>
                                {currentClassFlagUrlQuery.data && <img src={currentClassFlagUrlQuery.data} alt='' width={200} height={200} className='border-2'></img>}
                            </div>
                        )}

                        {currentFlagStatus[1]?.status ? (
                            <div className='h-full flex flex-col justify-start'>
                                {currentPrepFlagUrlQuery.data && <img src={currentPrepFlagUrlQuery.data} alt='' width={200} height={200} className='border-2'></img>}
                            </div>
                        ) : (
                            <div className='h-full flex flex-col justify-end'>
                                {currentPrepFlagUrlQuery.data && <img src={currentPrepFlagUrlQuery.data} alt='' width={200} height={200} className='border-2'></img>}
                            </div>
                        )}
                    </div>
                    <div className='h-full flex flex-col justify-evenly'>
                        <div>
                            <div className='text-8xl text-center'>⬆</div>
                            <div className='text-2xl font-bold text-center'>Up</div>
                        </div>
                        <div>
                            <div className='text-2xl font-bold text-center'>Down</div>
                            <div className='text-8xl text-center'>⬇</div>
                        </div>
                    </div>
                    <div className='flex w-full flex-row h-full justify-evenly'>
                        {nextFlagStatus[0]?.status ? (
                            <div className='h-full flex flex-col justify-start'>
                                {nextClassFlagUrlQuery.data && <img src={nextClassFlagUrlQuery.data} alt='' width={200} height={200} className='border-2'></img>}
                            </div>
                        ) : (
                            <div className='h-full flex flex-col justify-end'>
                                {nextClassFlagUrlQuery.data && <img src={nextClassFlagUrlQuery.data} alt='' width={200} height={200} className='border-2'></img>}
                            </div>
                        )}

                        {nextFlagStatus[1]?.status ? (
                            <div className='h-full flex flex-col justify-start'>
                                {nextPrepFlagUrlQuery.data && <img src={nextPrepFlagUrlQuery.data} alt='' width={200} height={200} className='border-2'></img>}
                            </div>
                        ) : (
                            <div className='h-full flex flex-col justify-end'>
                                {nextPrepFlagUrlQuery.data && <img src={nextPrepFlagUrlQuery.data} alt='' width={200} height={200} className='border-2'></img>}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
