import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Radio, RadioGroup } from '@nextui-org/react';
import { use } from 'chai';
import { set } from 'cypress/types/lodash';
import { useTheme } from 'next-themes';
import { ChangeEvent, useState } from 'react';
import Select, { CSSObjectWithLabel } from 'react-select';

export default function CreateResultModal({ isOpen, race, boats, onSubmit, onClose }: { isOpen: boolean, race: RaceDataType, boats: BoatDataType[], onSubmit: (helmValue: string, crewValue: string, boat: BoatDataType, sailNum: string, fleetId: string) => void, onClose: () => void }) {

    const [helmValue, setHelmValue] = useState('')
    const [crewValue, setCrewValue] = useState('')
    const [sailNumber, setSailNumber] = useState('')

    const { theme, setTheme } = useTheme()

    const [selectedFleet, setSelectedFleet] = useState(race.fleets[0]!.id)
    const [selectedOption, setSelectedOption] = useState({ label: "", value: {} as BoatDataType })

    let options: { label: string; value: BoatDataType }[] = []
    boats.forEach((boat: BoatDataType) => {
        options.push({ value: boat as BoatDataType, label: boat.name })
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

    const openUpdate = (open: boolean) => {
        if (!open) {
            setHelmValue('')
            setCrewValue('')
            setSailNumber('')
            setSelectedOption({ label: "", value: {} as BoatDataType })
        }
    }

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                scrollBehavior={'outside'}
                size='5xl'
                backdrop='blur'
                onOpenChange={(open) => openUpdate(open)}
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
                                        <Select
                                            id="Class"
                                            className=' w-56 h-full text-3xl'
                                            options={options}
                                            value={selectedOption}
                                            onChange={(choice) => setSelectedOption(choice!)}
                                            styles={{
                                                control: (provided, state) => ({
                                                    ...provided,
                                                    border: 'none',
                                                    padding: '0.5rem',
                                                    fontSize: '1rem',
                                                    borderRadius: '0.5rem',
                                                    color: 'white',
                                                    backgroundColor: theme == 'dark' ? '#27272a' : '#f4f4f5',
                                                    '&:hover': {
                                                        backgroundColor: theme == 'dark' ? '#3f3f46' : '#e4e4e7',
                                                    },
                                                } as CSSObjectWithLabel),
                                                option: (provided, state) => ({
                                                    ...provided,
                                                    color: theme == 'dark' ? 'white' : 'black',
                                                    backgroundColor: theme == 'dark' ? state.isSelected ? '#27272a' : '#18181b' : state.isSelected ? '#f4f4f5' : 'white',
                                                    '&:hover': {
                                                        backgroundColor: theme == 'dark' ? '#3f3f46' : '#d4d4d8',
                                                    },
                                                } as CSSObjectWithLabel),
                                                menu: (provided, state) => ({
                                                    ...provided,
                                                    backgroundColor: theme == 'dark' ? '#18181b' : 'white',
                                                    border: theme == 'dark' ? '2px solid #3f3f46' : '2px solid #d4d4d8',
                                                    fontSize: '1rem',

                                                } as CSSObjectWithLabel),
                                                input: (provided, state) => ({
                                                    ...provided,
                                                    color: theme == 'dark' ? 'white' : 'black',
                                                } as CSSObjectWithLabel),
                                                singleValue: (provided, state) => ({
                                                    ...provided,
                                                    color: theme == 'dark' ? 'white' : 'black',
                                                } as CSSObjectWithLabel),
                                            }}
                                        />
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
                                            onValueChange={(value) => setSelectedFleet(value)}
                                        >
                                            {
                                                race.fleets.map((fleet: FleetDataType, index) => {
                                                    return (
                                                        <Radio value={fleet.id} key={"fleetoptions" + fleet.id}>
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
                                <Button color="primary" onPress={() => onSubmit(helmValue, crewValue, selectedOption.value, sailNumber, race.fleets[0]!.id)}>
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
