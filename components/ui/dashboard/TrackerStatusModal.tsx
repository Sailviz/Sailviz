import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react';
import { useTheme } from 'next-themes';
import dayjs from 'dayjs';

export default function TrackerStatusModal({isOpen, tracker, onClose}: { isOpen: boolean, tracker: TrackerDataType | undefined, onClose?: () => void }) {
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
                        <ModalHeader className="flex flex-col gap-1">
                            Tracker Status
                        </ModalHeader>
                        <ModalBody>
                            <div className="flex w-full p-6">
                                <div className='flex flex-col w-full'>
                                    <p className='text-xl'>
                                        <strong>Name:</strong> {tracker?.name}<br/>
                                        <strong>Serial:</strong> {tracker?.trackerID}<br/>
                                        <strong>Status:</strong> {tracker?.status}<br/>
                                    </p>

                                    {tracker?.status != "Offline" ?
                                        <p className='text-xl pt-6'>
                                            <strong>GPS Status:</strong> {tracker?.details?.gps}<br/>
                                            <strong>Position (Lat, Lon):</strong> {tracker?.details?.position?.lat}, {tracker?.details?.position?.lon}<br/>
                                            <strong>Battery:</strong> {tracker?.details?.battery}<br/>
                                            <strong>Received:</strong> {dayjs(tracker?.details?.position?.timestamp as number * 1000).format('HH:mm:ss')}<br/>
                                        </p>
                                        :
                                        <></>
                                    }
                                </div>
                            </div>
                        </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};
