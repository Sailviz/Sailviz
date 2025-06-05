import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { useTheme } from 'next-themes'
import { ChangeEvent, useState } from 'react'

// these options are specific to each fleet
enum raceModeType {
    Lap,
    Finish,
    None
}

export default function FleetSelectDialog({
    isOpen,
    fleets,
    mode,
    onSubmit,
    onClose
}: {
    isOpen: boolean
    mode: raceModeType
    fleets: FleetDataType[]
    onSubmit: (fleetId: string, mode: raceModeType) => void
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
                <DialogHeader className='flex flex-col gap-1'></DialogHeader>
                <div className='flex w-full flex-col'>
                    <span className='text-xl font-extrabold flex justify-center mb-8 text-center'>Select Fleet to {mode === raceModeType.Finish ? 'Finish' : 'Lap'}:</span>
                    {fleets.map(fleet => {
                        return (
                            <div key={fleet.id} className='flex mb-2 justify-center'>
                                <Button onClick={() => onSubmit(fleet.id, mode)} size='lg' color='primary'>
                                    {fleet.fleetSettings.name}
                                </Button>
                            </div>
                        )
                    })}
                    <div key={'all'} className='flex mb-2 justify-center'>
                        <Button onClick={() => fleets.forEach(fleet => onSubmit(fleet.id, mode))} size='lg' color='primary'>
                            All Fleets
                        </Button>
                    </div>
                </div>
                <DialogFooter>
                    <Button color='danger' onClick={onClose}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
