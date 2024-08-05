import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Progress, Radio, RadioGroup } from '@nextui-org/react';
import { useTheme } from 'next-themes';
import { ChangeEvent, useState } from 'react';

export default function ProgressModal({ isOpen, onClose, Value, Max, Indeterminate }: { isOpen: boolean, onClose: () => void, Value: number, Max: number, Indeterminate: boolean }) {

    const [value, setValue] = useState(Value);
    const [maxValue, setMaxValue] = useState(Max);
    const [indeterminate, setIndeterminate] = useState(Indeterminate);

    const { theme, setTheme } = useTheme()
    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                scrollBehavior={'outside'}
                size='5xl'
                backdrop='blur'
                disableAnimation
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Create Series
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex w-full">
                                    <Progress
                                        disableAnimation
                                        aria-label="Downloading..."
                                        size="md"
                                        value={value}
                                        maxValue={maxValue}
                                        color="success"
                                        showValueLabel={true}
                                        className="max-w-md"
                                        isIndeterminate={indeterminate}
                                        label={`${value} of ${maxValue}`}
                                    />
                                </div>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};
