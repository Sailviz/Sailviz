import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { useTheme } from 'next-themes'
import Image from 'next/image'

const imageStyle = {
    border: '2px solid #000000'
}

export default function FlagDialog({
    isOpen,
    currentFlagStatus,
    nextFlagStatus,
    onClose
}: {
    isOpen: boolean
    currentFlagStatus: boolean[]
    nextFlagStatus: boolean[]
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
                <DialogHeader className='flex flex-col'>Flag Positions</DialogHeader>
                <div className='flex flex-row w-full justify-around'>
                    <div className='text-2xl font-bold'>Current</div>
                    <div className='text-2xl font-bold'>Next</div>
                </div>

                <div className='flex flex-row w-full h-full divide-dashed'>
                    <div className='flex w-full flex-row h-full justify-evenly'>
                        {currentFlagStatus[0] ? (
                            <div className='h-full flex flex-col justify-start'>
                                <Image src='/H_Flag.png' width={200} height={200} alt='flag1' style={imageStyle} />
                            </div>
                        ) : (
                            <div className='h-full flex flex-col justify-end'>
                                <Image src='/H_Flag.png' width={200} height={200} alt='flag1' style={imageStyle} />
                            </div>
                        )}
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
                        {currentFlagStatus[1] ? (
                            <div className='h-full flex flex-col justify-start'>
                                <Image src='/P_Flag.png' width={200} height={200} alt='flag1' style={imageStyle} />
                            </div>
                        ) : (
                            <div className='h-full flex flex-col justify-end'>
                                <Image src='/P_Flag.png' width={200} height={200} alt='flag1' style={imageStyle} />
                            </div>
                        )}
                    </div>
                    <div className='w-0.5 h-full border-2 border-dashed mx-4 border-black'></div>
                    <div className='flex w-full flex-row h-full justify-evenly'>
                        {nextFlagStatus[0] ? (
                            <div className='h-full flex flex-col justify-start'>
                                <Image src='/H_Flag.png' width={200} height={200} alt='flag1' style={imageStyle} />
                            </div>
                        ) : (
                            <div className='h-full flex flex-col justify-end'>
                                <Image src='/H_Flag.png' width={200} height={200} alt='flag1' style={imageStyle} />
                            </div>
                        )}
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
                        {nextFlagStatus[1] ? (
                            <div className='h-full flex flex-col justify-start'>
                                <Image src='/P_Flag.png' width={200} height={200} alt='flag1' style={imageStyle} />
                            </div>
                        ) : (
                            <div className='h-full flex flex-col justify-end'>
                                <Image src='/P_Flag.png' width={200} height={200} alt='flag1' style={imageStyle} />
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
