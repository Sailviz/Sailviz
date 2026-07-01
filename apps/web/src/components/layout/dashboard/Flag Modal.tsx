import { Dialog, DialogContent, DialogHeader } from '@components/ui/dialog'
import { orpcClient } from '@lib/orpc'
import * as Types from '@sailviz/types'
import { useQuery } from '@tanstack/react-query'

function FlagImage({ flagStatus }: { flagStatus: FlagStatusType }) {
    const { data: src } = useQuery({
        ...orpcClient.image.getURL.queryOptions({
            input: { s3key: flagStatus.flag.s3key }
        })
    })

    return (
        <div className={`h-full flex flex-col ${flagStatus.status ? 'justify-start' : 'justify-end'}`}>
            <img src={src} alt='' width={200} height={200} className='border-2'></img>
        </div>
    )
}

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
                        {currentFlagStatus.map((flagStatus, index) => (
                            <FlagImage key={`${flagStatus.flag.s3key}-${index}`} flagStatus={flagStatus} />
                        ))}
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
                        {nextFlagStatus.map((flagStatus, index) => (
                            <FlagImage key={`${flagStatus.flag.s3key}-${index}`} flagStatus={flagStatus} />
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
