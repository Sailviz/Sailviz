'use client'
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, useDisclosure, useModalContext } from '@nextui-org/react';
import { is } from 'cypress/types/bluebird';
import { set } from 'cypress/types/lodash';
import { ChangeEvent, useState } from 'react';

export default function CreateResultModal({ isOpen, onSubmit, onClose }: { isOpen: boolean, onSubmit: (helmValue: string, crewValue: string, boat: any, sailNum: string, fleetId: string[]) => void, onClose: () => void }) {

    const [helmValue, setHelmValue] = useState('')
    const [crewValue, setCrewValue] = useState('')
    const [boat, setBoat] = useState('')
    const [sailNumber, setSailNumber] = useState('')

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
                                        <Select
                                        // value={selectedOption}
                                        // onChange={(choice) => setSelectedOption(choice!)}
                                        >
                                            <SelectItem key={''}>fun</SelectItem>
                                        </Select>
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

                                <div className="text-4xl font-extrabold p-6">Select Race</div>

                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                                <Button color="primary" onPress={() => onSubmit(helmValue, crewValue, boat, sailNumber, [])}>
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

{/* <div className="mx-40 my-20 px-10 py-5 border w-4/5 bg-gray-300 rounded-sm">
                        <div className="text-6xl font-extrabold p-6 float-right cursor-pointer" onClick={hideAddBoatModal}>&times;</div>
                        <div className="text-6xl font-extrabold p-6">Add Entry</div>
                        <div className="flex w-3/4">
                            <div className='flex flex-col px-6 w-full'>
                                <p className='text-2xl font-bold'>
                                    Helm
                                </p>
                                <input type="text" id="Helm" name="Helm" className="h-full text-2xl p-4" onChange={CapitaliseInput} placeholder="J Bloggs" />
                            </div>
                            <div className='flex flex-col px-6 w-full'>
                                <p className='text-2xl font-bold'>
                                    Crew
                                </p>

                                <input type="text" id="Crew" className="h-full text-2xl p-4" onChange={CapitaliseInput} />
                            </div>
                            <div className='flex flex-col px-6 w-full'>
                                <p className='text-2xl font-bold'>
                                    Class
                                </p>
                                <div className="w-full p-2 mx-0 my-2">
                                    <Select
                                        id="Class"
                                        className=' w-56 h-full text-3xl'
                                        options={options}
                                        value={selectedOption}
                                        onChange={(choice) => setSelectedOption(choice!)}
                                    />
                                </div>
                            </div>
                            <div className='flex flex-col px-6 w-full'>
                                <p className='text-2xl font-bold'>
                                    Sail Number
                                </p>

                                <input type="text" id="SailNum" className="h-full text-2xl p-4" />
                            </div>
                        </div>
                        <div className="text-4xl font-extrabold p-6">Select Race</div>
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
                                            isOn={selectedRaces[index]!}
                                            onColour="#02c66f"
                                            handleToggle={() => { setSelectedRaces([...selectedRaces.slice(0, index), !selectedRaces[index], ...selectedRaces.slice(index + 1)]) }}
                                        />
                                        <label className=" pl-6 py-auto text-2xl font-bold" htmlFor={race.id}>{race.series.name} {race.number}</label>
                                        {/* show buttons for each fleet in a series */}
// {
//     race.fleets.map((fleet: FleetDataType, index) => {
//         return (
//             <div key={fleet.id + race.id} className="ml-6 cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0">
//                 {fleet.fleetSettings.name}
//             </div>
//         )
//     })
// }
// {
//     race.Type == "Pursuit" ?
//         <div className="pl-6 py-auto text-2xl font-bold">
//             Start Time: {String(Math.floor((selectedOption.value.pursuitStartTime || 0) / 60)).padStart(2, '0')}:{String((selectedOption.value.pursuitStartTime || 0) % 60).padStart(2, '0')}
//         </div>
//         :
//         <></>
// }

//                                     </div >
//                                 </div >
//                             )
//                         })}
// <div className=" flex justify-end mt-8">
//     <div className="p-6 w-1/4 mr-2">
//         <p id="confirmEntry" onClick={createResults} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0">
//             Add
//         </p>
//     </div>
// </div>
//                     </div > */}