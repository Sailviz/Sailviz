import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Radio, RadioGroup, Switch, Tab, Tabs } from '@nextui-org/react';
import { Key } from '@react-types/shared';
import { use } from 'chai';
import { useTheme } from 'next-themes';
import { ChangeEvent, useEffect, useState } from 'react';
import Select, { CSSObjectWithLabel } from 'react-select';

export default function CreateResultModal({ isOpen, races, boats, onSubmit, onClose }: { isOpen: boolean, races: RaceDataType[], boats: BoatDataType[], onSubmit: (helmValue: string, crewValue: string, boat: any, sailNum: string, fleetId: string[]) => void, onClose: () => void }) {

    const [helmValue, setHelmValue] = useState('')
    const [crewValue, setCrewValue] = useState('')
    const [sailNumber, setSailNumber] = useState('')

    const { theme, setTheme } = useTheme()

    const [selectedRaces, setSelectedRaces] = useState<string[]>([])
    const [selectedFleets, setSelectedFleets] = useState<string[]>([])
    const [selectedOption, setSelectedOption] = useState({ label: "", value: {} as BoatDataType })

    const [helmError, setHelmError] = useState(false)
    const [boatError, setBoatError] = useState(false)
    const [sailNumError, setSailNumError] = useState(false)

    let options: { label: string; value: BoatDataType }[] = []
    boats.forEach((boat: BoatDataType) => {
        options.push({ value: boat as BoatDataType, label: boat.name })
    })

    const CapitaliseInput = (e: ChangeEvent<HTMLInputElement>) => {
        const sentence = e.target.value.split(' ');
        const cursorPos = e.target.selectionStart
        const capitalizedWords = sentence.map(word => word.charAt(0).toUpperCase() + word.slice(1));
        const capitalisedSentence = capitalizedWords.join(' ')
        if (e.target.id == 'helm') setHelmValue(capitalisedSentence)
        if (e.target.id == 'crew') setCrewValue(capitalisedSentence)
    }

    const updateRaceSelection = (race: RaceDataType, value: boolean) => {
        if (value) {
            setSelectedRaces([...selectedRaces, race.id])
            setSelectedFleets([...selectedFleets, race.fleets[0]!.id])
        } else {
            setSelectedRaces(selectedRaces.filter((value) => value != race.id))
            //remove all fleets from the selected fleets that are in this race
            setSelectedFleets(selectedFleets.filter((value) => !race.fleets.flatMap(fleet => fleet.id).includes(value)))
        }

    }

    const Submit = () => {
        //check if all fields are filled in

        let error = false
        if (helmValue == '') {
            setHelmError(true)
            error = true
        }
        console.log(selectedOption)
        if (selectedOption.label == '') {
            setBoatError(true)
            error = true
        }
        if (sailNumber == '') {
            setSailNumError(true)
            error = true
        }
        if (error) return

        onSubmit(helmValue, crewValue, selectedOption.value, sailNumber, selectedFleets)
    }

    const clearFields = () => {
        console.log('clearing fields')
        setHelmValue('')
        setCrewValue('')
        setSailNumber('')
        setSelectedRaces([])
        setSelectedFleets([])
        setSelectedOption({ label: "", value: {} as BoatDataType })

    }

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                scrollBehavior={'outside'}
                size='5xl'
                backdrop='blur'
                onOpenChange={(open) => { if (!open) clearFields() }}
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
                                            onChange={(e) => { setHelmError(false); CapitaliseInput(e) }}
                                            placeholder="J Bloggs"
                                            variant='bordered'
                                            autoComplete='off'
                                            isInvalid={helmError}
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
                                            onChange={(choice) => { setBoatError(false); setSelectedOption(choice!) }}
                                            styles={{
                                                control: (provided, state) => ({
                                                    ...provided,
                                                    border: boatError ? '2px solid #f31260' : 'none',
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
                                            onChange={(e) => { setSailNumError(false); setSailNumber(e.target.value) }}
                                            isInvalid={sailNumError}
                                        />
                                    </div>
                                </div>

                                <div className="text-4xl font-extrabold p-6">Select Races</div>
                                {races.map((race, index) => {
                                    if (race.fleets.some(fleet => fleet.startTime != 0)) {
                                        //a fleet in the race has started so don't allow entry
                                        return <></>
                                    }

                                    return (
                                        <div className="mx-6 mb-10" key={race.id}>
                                            <div className="flex flex-row">
                                                <Switch
                                                    id={race.id + "Switch"}
                                                    onValueChange={(value) => { updateRaceSelection(race, value) }}
                                                    color="success"
                                                    size='lg'
                                                >
                                                    {race.series.name} {race.number}
                                                </Switch>
                                                <Tabs
                                                    aria-label="Options"
                                                    className='px-3'
                                                    selectedKey={race.fleets[0]!.id}
                                                    color="primary"
                                                    isDisabled={selectedRaces.findIndex((r) => r == race.id) == -1 ? true : false}
                                                    onSelectionChange={(key) => { console.log(key); key ? setSelectedFleets([...selectedFleets, key.toString()]) : setSelectedFleets(selectedFleets.filter((value) => value != key)) }}
                                                >
                                                    {/* show buttons for each fleet in a series */}
                                                    {race.fleets.map((fleet: FleetDataType, index) => {
                                                        return (
                                                            <Tab key={fleet.id} title={fleet.fleetSettings.name}>
                                                            </Tab>
                                                        )
                                                    })}
                                                </Tabs>

                                                {race.Type == "Pursuit" ?
                                                    <div className="pl-6 py-auto text-2xl font-bold text-gray-700">
                                                        Start Time: {String(Math.floor((selectedOption.value.pursuitStartTime || 0) / 60)).padStart(2, '0')}:{String((selectedOption.value.pursuitStartTime || 0) % 60).padStart(2, '0')}
                                                    </div>
                                                    :
                                                    <></>
                                                }

                                            </div>
                                        </div>
                                    )
                                })}


                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" onPress={() => Submit()}>
                                    Submit
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};
