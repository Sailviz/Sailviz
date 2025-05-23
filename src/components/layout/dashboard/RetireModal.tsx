import { Button } from '@/components/ui/button'
import { DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { useTheme } from 'next-themes'
import { ChangeEvent, useState } from 'react'

const resultCodes = [
    { desc: 'Did Not Finish', code: 'DNF' },
    { desc: 'Did Not Start', code: 'DNS' },
    { desc: 'Disqualified', code: 'DSQ' },
    { desc: 'On Course Side', code: 'OCS' },
    { desc: 'Not Sailed Course', code: 'NSC' }
]

export default function RetireDialog({
    isOpen,
    onSubmit,
    onClose,
    result
}: {
    isOpen: boolean
    onSubmit: (resultCode: string) => void
    onClose: () => void
    result: ResultsDataType
}) {
    const { theme, setTheme } = useTheme()
    return (
        <>
            <DialogContent>
                <DialogHeader className='flex flex-col gap-1'>Retire Boat</DialogHeader>
                <div className='flex w-full flex-col'>
                    <span className='text-xl font-extrabold flex justify-center mb-8 text-center'>
                        {result.boat.name} : {result.SailNumber} <br /> {result.Helm}{' '}
                    </span>
                    {resultCodes.map(resultCode => {
                        return (
                            <div key={resultCode.code} className='flex mb-2 justify-center'>
                                <Button onClick={() => onSubmit(resultCode.code)} size='lg' color='primary'>
                                    {resultCode.desc} ({resultCode.code})
                                </Button>
                            </div>
                        )
                    })}
                </div>
                <DialogFooter>
                    <Button color='danger' onClick={onClose}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </>
    )
}
