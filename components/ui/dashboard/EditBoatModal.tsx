import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Radio, RadioGroup } from '@nextui-org/react'
import { useTheme } from 'next-themes'
import { ChangeEvent, useEffect, useState } from 'react'
import { PageSkeleton } from '../PageSkeleton'

export default function EditBoatModal({
    isOpen,
    boat,
    onSubmit,
    onClose
}: {
    isOpen: boolean
    boat: BoatDataType | undefined
    onSubmit: (boat: BoatDataType) => void
    onClose: () => void
}) {
    const [boatName, setBoatName] = useState('')
    const [PY, setPY] = useState(0)
    const [Crew, setCrew] = useState(0)
    const [pursuitStartTime, setPursuitStartTime] = useState(0)

    const { theme, setTheme } = useTheme()

    useEffect(() => {
        if (boat === undefined) return
        setBoatName(boat.name)
        setPY(boat.py)
        setCrew(boat.crew)
        setPursuitStartTime(boat.pursuitStartTime)
    }, [boat])

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} scrollBehavior={'outside'} size='5xl' backdrop='blur'>
                <ModalContent>
                    {onClose => (
                        <>
                            <ModalHeader className='flex flex-col gap-1'>Edit Boat</ModalHeader>
                            <ModalBody>
                                <div className='flex w-full'>
                                    <div className='flex flex-col px-6 w-full'>
                                        <p className='text-2xl font-bold'>Name</p>

                                        <Input
                                            id='name'
                                            type='text'
                                            value={boatName}
                                            onChange={e => setBoatName(e.target.value)}
                                            placeholder='J Bloggs'
                                            variant='bordered'
                                            autoComplete='off'
                                        />
                                    </div>
                                    <div className='flex flex-col px-6 w-full'>
                                        <p className='text-2xl font-bold'>PY</p>
                                        <Input
                                            id='py'
                                            type='number'
                                            value={PY.toString()}
                                            onChange={e => setPY(parseInt(e.target.value))}
                                            autoComplete='off'
                                            variant='bordered'
                                        />
                                    </div>
                                    <div className='flex flex-col px-6 w-full'>
                                        <p className='text-2xl font-bold'>Crew</p>
                                        <Input
                                            id='crew'
                                            type='number'
                                            value={Crew.toString()}
                                            onChange={e => setCrew(parseInt(e.target.value))}
                                            autoComplete='off'
                                            variant='bordered'
                                        />
                                    </div>
                                    <div className='flex flex-col px-6 w-full'>
                                        <p className='text-xl font-bold'>Pursuit Start Time (s)</p>
                                        <Input
                                            id='starttime'
                                            type='number'
                                            value={pursuitStartTime.toString()}
                                            onChange={e => setPursuitStartTime(parseInt(e.target.value))}
                                            autoComplete='off'
                                            variant='bordered'
                                        />
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color='danger' variant='light' onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color='primary' onPress={() => onSubmit({ ...boat!, name: boatName, py: PY, crew: Crew, pursuitStartTime: pursuitStartTime })}>
                                    Save
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}
