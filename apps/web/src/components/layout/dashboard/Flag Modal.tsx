import { Dialog, DialogContent, DialogHeader } from '@components/ui/dialog'
import * as Types from '@sailviz/types'
const imageStyle = {
    border: '2px solid #000000'
}

enum raceStateType {
    countdown,
    running,
    stopped,
    reset,
    calculate,
    retire
}

export default function FlagDialog({
    isOpen,
    currentFlagStatus,
    nextFlagStatus,
    raceTime,
    raceState,
    countdownFleet,
    onClose
}: {
    isOpen: boolean
    currentFlagStatus: boolean[]
    nextFlagStatus: boolean[]
    raceTime: number
    raceState: raceStateType
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
                        {raceState == raceStateType.countdown ? '-' : '+'}
                        {Math.floor(raceTime / 60)
                            .toString()
                            .padStart(2, '00')}
                        :
                        {Math.floor(raceTime % 60) // Ensure seconds are rounded up, looks nicer
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
                        {currentFlagStatus[0] ? (
                            <div className='h-full flex flex-col justify-start'>
                                <img src='/H_Flag.png' width={200} height={200} alt='flag1' style={imageStyle} />
                            </div>
                        ) : (
                            <div className='h-full flex flex-col justify-end'>
                                <img src='/H_Flag.png' width={200} height={200} alt='flag1' style={imageStyle} />
                            </div>
                        )}

                        {currentFlagStatus[1] ? (
                            <div className='h-full flex flex-col justify-start'>
                                <img src='/P_Flag.png' width={200} height={200} alt='flag1' style={imageStyle} />
                            </div>
                        ) : (
                            <div className='h-full flex flex-col justify-end'>
                                <img src='/P_Flag.png' width={200} height={200} alt='flag1' style={imageStyle} />
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
                        {nextFlagStatus[0] ? (
                            <div className='h-full flex flex-col justify-start'>
                                <img src='/H_Flag.png' width={200} height={200} alt='flag1' style={imageStyle} />
                            </div>
                        ) : (
                            <div className='h-full flex flex-col justify-end'>
                                <img src='/H_Flag.png' width={200} height={200} alt='flag1' style={imageStyle} />
                            </div>
                        )}

                        {nextFlagStatus[1] ? (
                            <div className='h-full flex flex-col justify-start'>
                                <img src='/P_Flag.png' width={200} height={200} alt='flag1' style={imageStyle} />
                            </div>
                        ) : (
                            <div className='h-full flex flex-col justify-end'>
                                <img src='/P_Flag.png' width={200} height={200} alt='flag1' style={imageStyle} />
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
