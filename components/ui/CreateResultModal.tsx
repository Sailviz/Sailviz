'use client'
import { Autocomplete, AutocompleteItem, Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Radio, RadioGroup, Select, SelectItem, Switch, useDisclosure, useModalContext } from '@nextui-org/react';
import { ChangeEvent, useState } from 'react';

export default function CreateResultModal({ isOpen, race, boats, onSubmit, onClose }: { isOpen: boolean, race: RaceDataType, boats: BoatDataType[], onSubmit: (helmValue: string, crewValue: string, boat: any, sailNum: string, fleetId: string[]) => void, onClose: () => void }) {

    const [helmValue, setHelmValue] = useState('')
    const [crewValue, setCrewValue] = useState('')
    const [sailNumber, setSailNumber] = useState('')

    const [selectedRaces, setSelectedRaces] = useState<boolean[]>([])
    const [selectedOption, setSelectedOption] = useState<{ label: string, key: BoatDataType }>({ label: "", key: {} as BoatDataType })

    let options: { label: string; key: BoatDataType }[] = []
    boats.forEach(boat => {
        options.push({ key: boat as BoatDataType, label: boat.name })
    })

    const CapitaliseInput = (e: ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.id)
        const sentence = e.target.value.split(' ');
        const cursorPos = e.target.selectionStart
        const capitalizedWords = sentence.map(word => word.charAt(0).toUpperCase() + word.slice(1));
        const capitalisedSentence = capitalizedWords.join(' ')
        console.log(capitalisedSentence)
        if (e.target.id == 'helm') setHelmValue(capitalisedSentence)
        if (e.target.id == 'crew') setCrewValue(capitalisedSentence)
    }

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
                                Create New Entry
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex w-full">
                                    <div className='flex flex-col px-6 w-full'>
                                        <p className='text-2xl font-bold'>
                                            Helm
                                        </p>

                                        <Input
                                            id='helm'
                                            type="text"
                                            value={helmValue}
                                            onChange={CapitaliseInput}
                                            placeholder="J Bloggs"
                                            variant='bordered'
                                            autoComplete='off'
                                        />
                                    </div>
                                    <div className='flex flex-col px-6 w-full'>
                                        <p className='text-2xl font-bold'>
                                            Crew
                                        </p>
                                        <Input
                                            id='crew'
                                            type="text"
                                            value={crewValue}
                                            onChange={CapitaliseInput}
                                            autoComplete='off'
                                            variant='bordered'
                                        />
                                    </div>
                                    <div className='flex flex-col px-6 w-full'>
                                        <p className='text-2xl font-bold'>
                                            Class
                                        </p>
                                        <Autocomplete
                                            defaultItems={options}
                                            className="max-w-xs"
                                        // onSelectionChange={(choice) => setSelectedOption(choice)}
                                        >
                                            {(option) => <AutocompleteItem key={option.key.name}>{option.label}</AutocompleteItem>}
                                        </Autocomplete>
                                    </div>
                                    <div className='flex flex-col px-6 w-full'>
                                        <p className='text-2xl font-bold'>
                                            Sail Number
                                        </p>
                                        <Input
                                            type="text"
                                            id="SailNum"
                                            variant='bordered'
                                            autoComplete='off'
                                            onChange={(e) => setSailNumber(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="text-4xl font-extrabold p-6">Select Fleet</div>

                                <div className="mx-6 mb-10" key={race.id}>
                                    <div className="flex flex-row">
                                        {/* show buttons for each fleet in a series */}
                                        <RadioGroup
                                            defaultValue={race.fleets[0]!.id}
                                        >
                                            {
                                                race.fleets.map((fleet: FleetDataType, index) => {
                                                    return (
                                                        <Radio value={fleet.id} >
                                                            {fleet.fleetSettings.name}
                                                        </Radio>
                                                    )
                                                })
                                            }
                                        </RadioGroup>
                                    </div >
                                </div >


                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                                <Button color="primary" onPress={() => onSubmit(helmValue, crewValue, selectedOption, sailNumber, [])}>
                                    Add
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};
