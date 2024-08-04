import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Radio, RadioGroup } from '@nextui-org/react';
import { useTheme } from 'next-themes';
import { ChangeEvent, useState } from 'react';
import { PageSkeleton } from '../PageSkeleton';

export default function EditBoatModal({ isOpen, boat, onSubmit, onClose }: { isOpen: boolean, boat: BoatDataType | undefined, onSubmit: (boat: BoatDataType) => void, onClose: () => void }) {

    if (boat == undefined) {
        return (
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                scrollBehavior={'outside'}
                size='5xl'
                backdrop='blur'
            >
                <PageSkeleton />
            </Modal>)
    }

    const [boatName, setBoatName] = useState(boat.name)
    const [PY, setPY] = useState(boat.py)
    const [Crew, setCrew] = useState(boat.crew)
    const [pursuitStartTime, setPursuitStartTime] = useState(boat.pursuitStartTime)

    const { theme, setTheme } = useTheme()

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                scrollBehavior={'outside'}
                size='5xl'
                backdrop='blur'
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Edit Boat
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex w-full">
                                    <div className='flex flex-col px-6 w-full'>
                                        <p className='text-2xl font-bold'>
                                            Name
                                        </p>

                                        <Input
                                            id='name'
                                            type="text"
                                            value={boatName}
                                            onChange={(e) => setBoatName(e.target.value)}
                                            placeholder="J Bloggs"
                                            variant='bordered'
                                            autoComplete='off'
                                        />
                                    </div>
                                    <div className='flex flex-col px-6 w-full'>
                                        <p className='text-2xl font-bold'>
                                            PY
                                        </p>
                                        <Input
                                            id='py'
                                            type="number"
                                            value={PY.toString()}
                                            onChange={(e) => setPY(parseInt(e.target.value))}
                                            autoComplete='off'
                                            variant='bordered'
                                        />
                                    </div>
                                    <div className='flex flex-col px-6 w-full'>
                                        <p className='text-2xl font-bold'>
                                            Crew
                                        </p>
                                        <Input
                                            id='crew'
                                            type="number"
                                            value={Crew.toString()}
                                            onChange={(e) => setCrew(parseInt(e.target.value))}
                                            autoComplete='off'
                                            variant='bordered'
                                        />
                                    </div>
                                    <div className='flex flex-col px-6 w-full'>
                                        <p className='text-2xl font-bold'>
                                            Pursuit Start Time
                                        </p>
                                        <Input
                                            id='starttime'
                                            type="time"
                                            value={new Date(pursuitStartTime * 1000).toISOString().slice(14, 19)}
                                            onChange={(e) => setPursuitStartTime(parseInt(e.target.value) * 60)}
                                            autoComplete='off'
                                            variant='bordered'
                                        />
                                    </div>
                                </div>


                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                                <Button color="primary" onPress={() => onSubmit({ ...boat, name: boatName, py: PY, crew: Crew, pursuitStartTime: pursuitStartTime })}>
                                    Save
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};
