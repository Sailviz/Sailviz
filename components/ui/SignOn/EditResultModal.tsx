import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Radio, RadioGroup, Switch, Tab, Tabs } from '@nextui-org/react';
import { Key } from '@react-types/shared';
import { use } from 'chai';
import { useTheme } from 'next-themes';
import { ChangeEvent, useEffect, useState } from 'react';
import Select, { CSSObjectWithLabel } from 'react-select';

export default function EditResultModal({ isOpen, result, boats, onSubmit, onClose, onDelete }: { isOpen: boolean, result: ResultsDataType | undefined, boats: BoatDataType[], onSubmit: (result: ResultsDataType) => void, onClose: () => void, onDelete: (result: ResultsDataType) => void }) {

    const [helm, setHelm] = useState('')
    const [crew, setCrew] = useState('')
    const [sailNumber, setSailNumber] = useState('')

    const { theme, setTheme } = useTheme()

    const [selectedRaces, setSelectedRaces] = useState<string[]>([])
    const [selectedFleets, setSelectedFleets] = useState<string[]>([])
    const [selectedBoat, setSelectedBoat] = useState({ label: "", value: {} as BoatDataType })

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
        if (e.target.id == 'helm') setHelm(capitalisedSentence)
        if (e.target.id == 'crew') setCrew(capitalisedSentence)
    }

    function updateFleetSelection(race: RaceDataType, key: Key) {
        var tempSelected = window.structuredClone(selectedFleets)
        var filteredArray = tempSelected.filter((value: string) => !race.fleets.flatMap(fleet => fleet.id).includes(value));
        filteredArray = [...filteredArray, key]
        setSelectedFleets(filteredArray)
    }

    useEffect(() => {
        if (result == undefined) {
            return
        }
        console.log(result)
        setHelm(result.Helm)
        setCrew(result.Crew)
        setSailNumber(result.SailNumber)
        setSelectedBoat({ label: result.boat.name, value: result.boat })
    }, [result])

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
                                Edit Entry
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
                                            value={helm}
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
                                            value={crew}
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
                                            value={selectedBoat}
                                            onChange={(choice) => setSelectedBoat(choice!)}
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
                                            value={sailNumber}
                                            onValueChange={setSailNumber}
                                        />
                                    </div>
                                </div>

                                <div className="text-4xl font-extrabold p-6">Select Fleet</div>
                                {/* {races.map((race, index) => {
                                    if (race.fleets.some(fleet => fleet.startTime != 0)) {
                                        //a fleet in the race has started so don't allow entry
                                        return <></>
                                    }

                                    return (
                                        <div className="mx-6 mb-10" key={race.id}>
                                            <div className="flex flex-row">
                                                <Switch
                                                    id={race.id + "Switch"}
                                                    onValueChange={(value) => { value ? setSelectedRaces([...selectedRaces, race.id]) : setSelectedRaces(selectedRaces.filter((value) => value != race.id)) }}
                                                    color="success"
                                                    size='lg'
                                                >
                                                    {race.series.name} {race.number}
                                                    <Tabs
                                                        aria-label="Options"
                                                        selectedKey={race.fleets[0]!.id}
                                                        color="primary"
                                                        isDisabled={selectedRaces.findIndex((r) => r == race.id) ? true : false}
                                                        onSelectionChange={(key) => { updateFleetSelection(race, key) }}
                                                    >
                                                        {race.fleets.map((fleet: FleetDataType) => {
                                                            return (
                                                                <Tab key={fleet.id} title={fleet.fleetSettings.name}>
                                                                </Tab>
                                                            )
                                                        })}
                                                    </Tabs>
                                                </Switch>

                                                {race.Type == "Pursuit" ?
                                                    <div className="pl-6 py-auto text-2xl font-bold text-gray-700">
                                                        Start Time: {String(Math.floor((selectedBoat.value.pursuitStartTime || 0) / 60)).padStart(2, '0')}:{String((selectedBoat.value.pursuitStartTime || 0) % 60).padStart(2, '0')}
                                                    </div>
                                                    :
                                                    <></>
                                                }

                                            </div>
                                        </div>
                                    )
                                })} */}


                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" onPress={() => onDelete(result!)}>
                                    Remove
                                </Button>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                                <Button color="primary" onPress={() => onSubmit({ ...result!, Helm: helm, Crew: crew, boat: selectedBoat.value, SailNumber: sailNumber })}>
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
