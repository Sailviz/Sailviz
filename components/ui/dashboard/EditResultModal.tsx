import { Button, Checkbox, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Radio, RadioGroup, Switch } from '@nextui-org/react';
import { useTheme } from 'next-themes';
import { ChangeEvent, useEffect, useState } from 'react';
import { PageSkeleton } from '../PageSkeleton';
import * as DB from 'components/apiMethods'
import Select, { CSSObjectWithLabel } from 'react-select';
import * as Fetcher from 'components/Fetchers';
import { mutate } from 'swr';

const resultCodeOptions = [
    { label: 'None', value: '' },
    { label: 'Did Not Finish', value: 'DNF' },
    { label: 'Did Not Start', value: 'DNS' },
    { label: 'Disqualified', value: 'DSQ' },
    { label: 'On Course Side', value: 'OCS' },
    { label: 'Not Sailed Course', value: 'NSC' }]


export default function EditResultModal({ isOpen, result, fleet, onSubmit, onClose, onDelete }: { isOpen: boolean, result: ResultsDataType | undefined, fleet: FleetDataType | undefined, onSubmit: (resut: ResultsDataType) => void, onDelete: (result: ResultsDataType) => void, onClose: () => void }) {
    const { theme, setTheme } = useTheme()
    const { boats, boatsIsError, boatsIsValidating } = Fetcher.Boats()

    const [lapsAdvancedMode, setLapsAdvancedMode] = useState(false)
    const [resultCodeOption, setResultCodeOption] = useState({ label: "", value: "" })
    const [boatOption, setBoatOption] = useState({ label: "", value: {} as BoatDataType })
    const [laps, setLaps] = useState([] as LapDataType[])
    let finishTime = 0

    const [finished, setFinished] = useState(false)

    const [basicNumLaps, setBasicNumLaps] = useState(0)
    const [basicElapsed, setBasicElapsed] = useState("00:00:00")

    const [helm, setHelm] = useState("")
    const [crew, setCrew] = useState("")
    const [boat, setBoat] = useState<BoatDataType>({} as BoatDataType)
    const [sailNumber, setSailNumber] = useState("")


    let options: { label: string; value: BoatDataType }[] = []
    boats.forEach((boat: BoatDataType) => {
        options.push({ value: boat as BoatDataType, label: boat.name })
    })


    const updateLapDataAdvanced = async (lap: LapDataType, value: string) => {
        var parts = value.split(':'); // split it at the colons

        // minutes are 60 seconds. Hours are 60 minutes * 60 seconds.
        var seconds = (+parts[0]!) * 60 * 60 + (+parts[1]!) * 60 + (+parts[2]!);
        //add lap time to fleet start time
        var unixTime = seconds + fleet!.startTime

        lap = { ...lap, time: unixTime }

        let index = laps.findIndex(l => l.id == lap.id)
        setLaps([...laps.slice(0, index), lap, ...laps.slice(index + 1)])
    }

    const updateLapDataBasic = async () => {
        if (result == undefined) return
        var parts = basicElapsed.split(':'); // split it at the colons

        // minutes are 60 seconds. Hours are 60 minutes * 60 seconds.
        var seconds = (+parts[0]!) * 60 * 60 + (+parts[1]!) * 60 + (+parts[2]!);
        //add lap time to fleet start time
        var unixTime = seconds + fleet!.startTime
        console.log(unixTime)
        finishTime = finished ? unixTime : 0

        let entryLaps = laps.length
        console.log(entryLaps, basicNumLaps)
        if (entryLaps == basicNumLaps) {
            //don't do anything if there aren't any laps
            if (basicNumLaps != 0) {
                //don't have an update for the last lap
                await DB.DeleteLapById(laps[entryLaps - 1]!.id)
                await DB.CreateLap(result.id, unixTime)
            }
        } else if (entryLaps < basicNumLaps) {
            let difference = basicNumLaps - entryLaps
            for (let i = 0; i < difference - 1; i++) {
                await DB.CreateLap(result.id, 0)
            }
            await DB.CreateLap(result.id, unixTime)
        } else {
            if (basicNumLaps == 0) {
                //delete all laps
                for (let i = 0; i < entryLaps; i++) {
                    await DB.DeleteLapById(laps[i]!.id)
                }
            } else {
                //delete the extra laps
                let difference = entryLaps - basicNumLaps
                console.log(difference)
                console.log(result.laps)
                for (let i = 0; i <= difference; i++) {
                    console.log(laps[entryLaps - 1 - i]!.id)
                    await DB.DeleteLapById(laps[entryLaps - 1 - i]!.id)
                }
                await DB.CreateLap(result.id, unixTime)
            }

        }
    }

    const submit = async () => {
        if (lapsAdvancedMode) {
            if (result == undefined) {
                console.log('result is undefined')
                return
            }

            let lapscopy = window.structuredClone(laps)

            if (result.laps.length < laps.length) {
                //add the extra laps
                for (let i = lapscopy.length - 1; i >= result.laps.length; i--) {
                    let lap = await DB.CreateLap(result.id, lapscopy[i]!.time)
                    //modify local laps to include the lap id
                    lapscopy = [...lapscopy.slice(0, i), lap, ...lapscopy.slice(i + 1)]
                }
            } else {
                //delete the extra laps
                for (let i = result.laps.length - 1; i >= lapscopy.length; i--) {
                    await DB.DeleteLapById(result.laps[i]!.id)
                }
            }

            //update the times
            for (let i = 0; i < lapscopy.length; i++) {
                if (laps[i]!.time != result?.laps[i]!.time) {
                    await DB.DeleteLapById(lapscopy[i]!.id)
                    await DB.CreateLap(result!.id, lapscopy[i]!.time)
                }
            }

            finishTime = finished ? lapscopy[lapscopy.length - 1]!.time : 0
        } else {
            await updateLapDataBasic()
        }
        onSubmit({ ...result!, Helm: helm, Crew: crew, boat: boat, SailNumber: sailNumber, finishTime: finishTime, resultCode: resultCodeOption.value })
    }

    useEffect(() => {
        if (result == undefined) {
            return
        }
        setHelm(result.Helm)
        setCrew(result.Crew)
        setBoat(result.boat)
        setSailNumber(result.SailNumber)
        setLaps(result.laps)
        setBasicNumLaps(result.laps.length)
        setBasicElapsed(new Date(Math.max(0, (result.finishTime - fleet!.startTime) * 1000)).toISOString().substring(11, 19))
        setFinished(result.finishTime != 0)
        setBoatOption({ label: result.boat.name, value: result.boat })
        setResultCodeOption(result.resultCode == '' ? { label: 'None', value: '' } : { label: result.resultCode, value: result.resultCode })
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
                            <ModalHeader className="flex flex-col gap-1 text-2xl">
                                Edit Result
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col w-full">
                                    <div className="flex flex-row w-full">
                                        <div className='flex flex-col px-6 w-full'>
                                            <p className='text-2xl font-bold'>
                                                Helm
                                            </p>

                                            <Input
                                                type="text"
                                                value={helm}
                                                onValueChange={setHelm}
                                                fullWidth
                                                placeholder=' '
                                            />
                                        </div>

                                        <div className='flex flex-col px-6 w-full'>
                                            <p className='text-2xl font-bold'>
                                                Crew
                                            </p>

                                            <Input
                                                type="text"
                                                value={crew}
                                                onValueChange={setCrew}
                                                placeholder=' '
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
                                                value={boatOption}
                                                onChange={(choice) => setBoatOption(choice!)}
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
                                                value={sailNumber}
                                                onValueChange={setSailNumber}
                                                fullWidth
                                                placeholder=' '
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-row mt-2">
                                        <p className="text-2xl font-bold py-6">
                                            Result Info
                                        </p>

                                        <div className="p-6 flex flex-row w-24">
                                            <Checkbox
                                                onValueChange={(value) => setFinished(value)}
                                                isSelected={finished}
                                            >
                                                Finished
                                            </Checkbox>
                                        </div>
                                    </div>

                                    <div className="flex flex-row mt-2">
                                        <div className='flex flex-col px-6 w-1/4'>
                                            <p className='text-2xl font-bold'>
                                                Finish Code
                                            </p>

                                            <Select
                                                id="editResultCode"
                                                className=' w-56 h-full text-3xl'
                                                options={resultCodeOptions}
                                                value={resultCodeOption}
                                                onChange={(choice) => setResultCodeOption(choice!)}
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

                                        <div className='flex flex-col px-6 w-1/4'>
                                            <p className='text-2xl font-bold'>
                                                Position
                                            </p>

                                            <Input
                                                type="number"
                                                placeholder=' '
                                            />
                                        </div>

                                        {lapsAdvancedMode ?
                                            <div className='flex flex-row w-full flex-wrap' id='LapData'
                                                 key={JSON.stringify(laps)}>
                                                {laps.map((lap: LapDataType, index: number) => {
                                                    return (
                                                        <div className='flex flex-col px-6 w-min'
                                                             key={lap.time + index}>
                                                            <p className='text-2xl font-bold p-2'>
                                                                Lap {index + 1}
                                                            </p>
                                                            <div className='flex flex-row'>
                                                                <Input
                                                                    type="time"
                                                                    step={"1"}
                                                                    defaultValue={new Date(Math.max(0, (lap.time - fleet!.startTime) * 1000)).toISOString().substring(11, 19)}
                                                                    onBlur={(e) => {
                                                                        updateLapDataAdvanced(lap, (e.target as HTMLInputElement).value)
                                                                    }}
                                                                />
                                                                <div
                                                                    className="text-4xl font-extrabold text-red-600 px-2 float-right cursor-pointer"
                                                                    onClick={() => setLaps([...laps.slice(0, index), ...laps.slice(index + 1)])}>&times;</div>
                                                            </div>

                                                        </div>
                                                    )
                                                })}
                                                <div className="p-4 mr-2 w-96 flex justify-end">
                                                    <Button onClick={() => setLaps([...laps, {
                                                        id: "",
                                                        time: 0,
                                                        resultId: result!.id
                                                    } as LapDataType])}>
                                                        Add Lap
                                                    </Button>
                                                </div>
                                            </div>
                                            :
                                            <div className='flex flex-row w-full'>
                                                <div className='flex flex-col px-6 w-full' key={basicNumLaps}>
                                                    <p className='text-2xl font-bold'>
                                                        Laps
                                                    </p>

                                                    <Input
                                                        type="number"
                                                        id="NumberofLaps"
                                                        defaultValue={basicNumLaps.toString()}
                                                        onValueChange={(value) => {
                                                            setBasicNumLaps(parseInt(value))
                                                        }}
                                                    />
                                                </div>

                                                <div className='flex flex-col px-6 w-full' key={basicElapsed}>
                                                    <p className='text-2xl font-bold'>
                                                        Finish Time
                                                    </p>

                                                    <Input
                                                        type="time"
                                                        step={"1"}
                                                        defaultValue={basicElapsed}
                                                        onValueChange={(value) => {
                                                            setBasicElapsed(value)
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        }


                                    </div>
                                    <div className="flex flex-row mt-2 px-6">
                                        <Switch
                                            id={"AdvancedModeSwitch"}
                                            isSelected={lapsAdvancedMode}
                                            onValueChange={() => {
                                                setLapsAdvancedMode(!lapsAdvancedMode)
                                            }}
                                        />

                                        <label className="text-2xl font-bold"
                                               htmlFor={"AdvancedModeSwitch"}>Advanced Mode</label>
                                    </div>
                                </div>


                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" onPress={() => onDelete(result!)}>
                                    Remove
                                </Button>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                                <Button color="primary" onPress={submit}>
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