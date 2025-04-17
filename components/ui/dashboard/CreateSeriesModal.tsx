import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Radio, RadioGroup } from '@nextui-org/react';
import { useTheme } from 'next-themes';
import { ChangeEvent, useState } from 'react';
import { PageSkeleton } from '../PageSkeleton';

export default function CreateSeriesModal({ isOpen, onSubmit, onClose }: { isOpen: boolean, onSubmit: (name: string) => void, onClose: () => void }) {


    const [seriesName, setSeriesName] = useState("")

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
                                Create Series
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
                                            value={seriesName}
                                            onChange={(e) => setSeriesName(e.target.value)}
                                            placeholder="Name"
                                            variant='bordered'
                                            autoComplete='off'
                                        />
                                    </div>
                                </div>


                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                                <Button color="primary" onPress={() => onSubmit(seriesName)}>
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
