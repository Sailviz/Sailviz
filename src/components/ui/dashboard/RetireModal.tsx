import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Radio, RadioGroup } from '@nextui-org/react';
import { useTheme } from 'next-themes';
import { ChangeEvent, useState } from 'react';
import { PageSkeleton } from '../PageSkeleton';

const resultCodes = [
    { 'desc': 'Did Not Finish', 'code': 'DNF' },
    { 'desc': 'Did Not Start', 'code': 'DNS' },
    { 'desc': 'Disqualified', 'code': 'DSQ' },
    { 'desc': 'On Course Side', 'code': 'OCS' },
    { 'desc': 'Not Sailed Course', 'code': 'NSC' }]


export default function RetireModal({ isOpen, onSubmit, onClose, result }: { isOpen: boolean, onSubmit: (resultCode: string) => void, onClose: () => void, result: ResultsDataType }) {

    const { theme, setTheme } = useTheme()
    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                scrollBehavior={'outside'}
                size='xl'
                backdrop='blur'
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Retire Boat
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex w-full flex-col">
                                    <span className="text-xl font-extrabold flex justify-center mb-8 text-center">{result.boat.name} : {result.SailNumber} <br /> {result.Helm} </span>
                                    {resultCodes.map((resultCode) => {
                                        return (
                                            <div key={resultCode.code} className="flex mb-2 justify-center">
                                                <Button
                                                    onClick={() => onSubmit(resultCode.code)}
                                                    size="lg"
                                                    color='primary'
                                                >
                                                    {resultCode.desc} ({resultCode.code})
                                                </Button>
                                            </div>
                                        )
                                    })
                                    }
                                </div>


                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};
