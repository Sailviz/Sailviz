import { Button } from '@components/ui/button'
import { Dialog, DialogContent, DialogHeader } from '@components/ui/dialog'
import { useEffect, useRef, useState } from 'react'

export enum RecallType {
    None,
    Individual,
    General
}
export default function RecallDialog({
    isOpen,

    onClose
}: {
    isOpen: boolean

    onClose: (recall: RecallType) => void
}) {
    const [remainingSeconds, setRemainingSeconds] = useState(30)
    const onCloseRef = useRef(onClose)

    useEffect(() => {
        onCloseRef.current = onClose
    }, [onClose])

    useEffect(() => {
        if (!isOpen) return

        setRemainingSeconds(30)

        const timer = window.setInterval(() => {
            setRemainingSeconds(currentSeconds => {
                if (currentSeconds <= 1) {
                    window.clearInterval(timer)
                    onCloseRef.current(RecallType.None)
                    return 0
                }

                return currentSeconds - 1
            })
        }, 1000)

        return () => window.clearInterval(timer)
    }, [isOpen])

    return (
        <Dialog
            open={isOpen}
            onOpenChange={open => {
                if (!open) onClose(RecallType.None) // this catches the x button and clicking outside the modal, gets out of parallel route
            }}
        >
            <DialogContent className='max-w-8/12'>
                <DialogHeader className='flex flex-col'></DialogHeader>
                <h1 className='text-center'>
                    <>Start Line Clear?</>
                </h1>
                <p className='text-center text-sm text-muted-foreground'>Auto line clear in {remainingSeconds} seconds</p>

                <div className='flex flex-row w-full h-full items-center justify-center'>
                    <Button variant={'green'} className=' w-48 m-6 h-4/6 text-xl' onClick={() => onClose(RecallType.None)}>
                        Line Clear
                    </Button>
                    <Button variant={'warning'} className=' w-48 m-6 h-4/6 text-xl' onClick={() => onClose(RecallType.Individual)}>
                        Individual Recall
                    </Button>
                    <Button variant={'red'} className=' w-48 m-6 h-4/6 text-xl' onClick={() => onClose(RecallType.General)}>
                        General Recall
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
