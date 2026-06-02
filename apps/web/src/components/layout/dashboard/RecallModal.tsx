import { Button } from '@components/ui/button'
import { Dialog, DialogContent, DialogHeader } from '@components/ui/dialog'

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
    return (
        <Dialog
            open={isOpen}
            onOpenChange={open => {
                if (!open) onClose(RecallType.None) // this catches the x button and clicking outside the modal, gets out of parallel route
            }}
        >
            <DialogContent>
                <DialogHeader className='flex flex-col'></DialogHeader>
                <h1 className='text-center'>
                    <>Start Line Clear?</>
                </h1>

                <div className='flex flex-row w-full h-full divide-dashed'>
                    <Button variant='outline' onClick={() => onClose(RecallType.None)} className='w-1/2 h-full rounded-none border-r-0'>
                        Line Clear
                    </Button>
                    <Button variant='outline' onClick={() => onClose(RecallType.Individual)} className='w-1/2 h-full rounded-none border-l-0'>
                        Individual Recall
                    </Button>
                    <Button variant='outline' onClick={() => onClose(RecallType.General)} className='w-1/2 h-full rounded-none border-r-0'>
                        General Recall
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
