import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Radio, RadioGroup } from '@nextui-org/react';
import { useTheme } from 'next-themes';
import { ChangeEvent, useEffect, useState } from 'react';
import Select from 'react-select';
import * as Fetcher from 'components/Fetchers';
import { PERMISSIONS } from 'components/helpers/users';

export default function EditFleetSettingsModal({ isOpen, fleetSettings, onSubmit, onClose }: { isOpen: boolean, fleetSettings: FleetSettingsType | undefined, onSubmit: (fleetSettings: FleetSettingsType) => void, onClose: () => void }) {

    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { boats, boatsIsError, boatsIsValidating } = Fetcher.Boats()

    const [name, setName] = useState("")
    const [startDelay, setStartDelay] = useState(0)
    const [selectedBoats, setSelectedBoats] = useState([{ label: "", value: {} as BoatDataType }])
    const [options, setOptions] = useState([{ label: "", value: {} as BoatDataType }])


    const { theme, setTheme } = useTheme()

    useEffect(() => {
        if (fleetSettings === undefined || boats == undefined) return
        console.log(fleetSettings)
        setName(fleetSettings.name)
        setStartDelay(fleetSettings.startDelay)
        setSelectedBoats(fleetSettings.boats.map(x => ({ value: x, label: x.name })))

        let tempoptions: { label: string; value: BoatDataType }[] = []
        boats.forEach(boat => {
            tempoptions.push({ value: boat as BoatDataType, label: boat.name })
        })
        setOptions(tempoptions)

    }, [fleetSettings])

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
                                Edit Fleet
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex w-full">
                                    <div className='flex flex-col px-6 w-full'>
                                        <p className='text-2xl font-bold'>
                                            Name
                                        </p>
                                        <Input
                                            type="text"
                                            value={name}
                                            onValueChange={setName}
                                        />
                                    </div>
                                    <div className='flex flex-col px-6 w-full'>
                                        <p className='text-2xl font-bold'>
                                            Start Delay
                                        </p>
                                        <Input
                                            type="number"
                                            value={startDelay.toString()}
                                            onValueChange={(delay) => setStartDelay(parseInt(delay))}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-6xl font-extrabold p-6">
                                        Boats
                                    </p>
                                    <div className='flex flex-col px-6 w-full'>
                                        <p className='text-2xl font-bold'>
                                            Class
                                        </p>
                                        <div className="w-full p-2 mx-0 my-2">
                                            <Select
                                                id="editClass"
                                                className=' w-full h-full text-3xl'
                                                options={options}
                                                isMulti={true}
                                                isClearable={false}
                                                value={selectedBoats}
                                                onChange={(choice) => setSelectedBoats(choice! as [])}
                                            />
                                        </div>
                                    </div>
                                </div>

                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                                <Button color="primary" onPress={() => onSubmit({ ...fleetSettings!, name: name, startDelay: startDelay, boats: selectedBoats.flatMap(boats => boats.value) })}>
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
