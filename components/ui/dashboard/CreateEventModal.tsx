import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Radio, RadioGroup } from '@nextui-org/react';
import { useTheme } from 'next-themes';
import { ChangeEvent, useEffect, useState } from 'react';
import { PageSkeleton } from '../PageSkeleton';

export default function CreateEventModal({ isOpen, onSubmit, onClose }: { isOpen: boolean, onSubmit: (name: string, numberOfRaces: number) => void, onClose: () => void }) {


    const [name, setName] = useState("")
    const [numberOfRaces, setNumberOfRaces] = useState(0)

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
                                Create New Event
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
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            variant='bordered'
                                            autoComplete='off'
                                        />
                                    </div>
                                    <div className='flex flex-col px-6 w-full'>
                                        <p className='text-2xl font-bold'>
                                            Number Of Races
                                        </p>
                                        <Input
                                            id='numberOfRaces'
                                            type="number"
                                            value={numberOfRaces.toString()}
                                            onChange={(e) => setNumberOfRaces(parseInt(e.target.value))}
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
                                <Button color="primary" onPress={() => onSubmit(name, numberOfRaces)}>
                                    Create
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};
