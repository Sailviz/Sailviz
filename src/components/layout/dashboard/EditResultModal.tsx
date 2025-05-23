'use client'

import { useTheme } from 'next-themes'
import { ChangeEvent, useEffect, useState } from 'react'
import * as DB from '@/components/apiMethods'
import Select, { CSSObjectWithLabel } from 'react-select'
import * as Fetcher from '@/components/Fetchers'
import { mutate } from 'swr'
import { DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'

const resultCodeOptions = [
    { label: 'None', value: '' },
    { label: 'Did Not Finish', value: 'DNF' },
    { label: 'Did Not Start', value: 'DNS' },
    { label: 'Disqualified', value: 'DSQ' },
    { label: 'On Course Side', value: 'OCS' },
    { label: 'Not Sailed Course', value: 'NSC' }
]

export default function EditResultDialog({
    isOpen,
    result,
    fleet,
    raceType,
    advancedEdit,
    onSubmit,
    onClose,
    onDelete
}: {
    isOpen: boolean
    result: ResultsDataType | undefined
    fleet: FleetDataType | undefined
    raceType: string
    advancedEdit: boolean
    onSubmit: (resut: ResultsDataType) => void
    onDelete: (result: ResultsDataType) => void
    onClose: () => void
}) {
    const { theme, setTheme } = useTheme()
    const { boats, boatsIsError, boatsIsValidating } = Fetcher.Boats()

    const [lapsAdvancedMode, setLapsAdvancedMode] = useState(false)
    const [resultCodeOption, setResultCodeOption] = useState({ label: '', value: '' })
    const [boatOption, setBoatOption] = useState({ label: '', value: {} as BoatDataType })
    const [numberLaps, setNumberLaps] = useState(0)

    const [basicElapsed, setBasicElapsed] = useState('00:00:00')

    const [helm, setHelm] = useState('')
    const [crew, setCrew] = useState('')
    const [boat, setBoat] = useState<BoatDataType>({} as BoatDataType)
    const [sailNumber, setSailNumber] = useState('')

    const [handicapPosition, setHandicapPosition] = useState(0)
    const [pursuitPosition, setPursuitPosition] = useState(0)

    let options: { label: string; value: BoatDataType }[] = []
    boats.forEach((boat: BoatDataType) => {
        options.push({ value: boat as BoatDataType, label: boat.name })
    })

    const submit = async () => {
        let finishTime = basicElapsed.split(':').reduce((acc, time) => 60 * acc + +time, 0) + fleet!.startTime

        onSubmit({
            ...result!,
            Helm: helm,
            Crew: crew,
            boat: boat,
            SailNumber: sailNumber,
            finishTime: finishTime,
            resultCode: resultCodeOption.value,
            numberLaps: numberLaps,
            PursuitPosition: pursuitPosition,
            HandicapPosition: handicapPosition
        })
    }

    useEffect(() => {
        if (result == undefined) {
            return
        }
        setHelm(result.Helm)
        setCrew(result.Crew)
        setBoat(result.boat)
        setHandicapPosition(result.HandicapPosition)
        setPursuitPosition(result.PursuitPosition)
        setSailNumber(result.SailNumber)
        setNumberLaps(result.numberLaps)
        setBasicElapsed(new Date(Math.max(0, (result.finishTime - fleet!.startTime) * 1000)).toISOString().substring(11, 19))
        if (result.boat != null) {
            setBoatOption({ label: result.boat.name, value: result.boat })
        } else {
            setBoatOption({ label: '', value: {} as BoatDataType })
        }
        setResultCodeOption(result.resultCode == '' ? { label: 'None', value: '' } : { label: result.resultCode, value: result.resultCode })
    }, [result])

    return (
        <>
            <DialogContent>
                <DialogHeader className='flex flex-col gap-1 text-2xl'>Edit Result</DialogHeader>
                <div className='flex flex-col w-full'>
                    <div className='flex flex-row w-full'>
                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold'>Helm</p>

                            {/* <Input type='text' value={helm} onValueChange={setHelm} fullWidth placeholder=' ' /> */}
                        </div>

                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold'>Crew</p>

                            {/* <Input type='text' value={crew} onValueChange={setCrew} placeholder=' ' /> */}
                        </div>

                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold'>Class</p>

                            <Select
                                id='Class'
                                className=' w-56 h-full text-3xl'
                                options={options}
                                value={boatOption}
                                onChange={choice => {
                                    setBoatOption(choice!)
                                    setBoat(choice!.value)
                                }}
                                styles={{
                                    control: (provided, state) =>
                                        ({
                                            ...provided,
                                            border: 'none',
                                            padding: '0.5rem',
                                            fontSize: '1rem',
                                            borderRadius: '0.5rem',
                                            color: 'white',
                                            backgroundColor: theme == 'dark' ? '#27272a' : '#f4f4f5',
                                            '&:hover': {
                                                backgroundColor: theme == 'dark' ? '#3f3f46' : '#e4e4e7'
                                            }
                                        } as CSSObjectWithLabel),
                                    option: (provided, state) =>
                                        ({
                                            ...provided,
                                            color: theme == 'dark' ? 'white' : 'black',
                                            backgroundColor: theme == 'dark' ? (state.isSelected ? '#27272a' : '#18181b') : state.isSelected ? '#f4f4f5' : 'white',
                                            '&:hover': {
                                                backgroundColor: theme == 'dark' ? '#3f3f46' : '#d4d4d8'
                                            }
                                        } as CSSObjectWithLabel),
                                    menu: (provided, state) =>
                                        ({
                                            ...provided,
                                            backgroundColor: theme == 'dark' ? '#18181b' : 'white',
                                            border: theme == 'dark' ? '2px solid #3f3f46' : '2px solid #d4d4d8',
                                            fontSize: '1rem'
                                        } as CSSObjectWithLabel),
                                    input: (provided, state) =>
                                        ({
                                            ...provided,
                                            color: theme == 'dark' ? 'white' : 'black'
                                        } as CSSObjectWithLabel),
                                    singleValue: (provided, state) =>
                                        ({
                                            ...provided,
                                            color: theme == 'dark' ? 'white' : 'black'
                                        } as CSSObjectWithLabel)
                                }}
                            />
                        </div>

                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold'>Sail Number</p>

                            {/* <Input type='text' value={sailNumber} onValueChange={setSailNumber} fullWidth placeholder=' ' /> */}
                        </div>
                    </div>
                    {advancedEdit ? (
                        <>
                            <div className='flex flex-row mt-2'>
                                <p className='text-2xl font-bold py-6'>Result Info</p>
                            </div>

                            <div className='flex flex-row mt-2'>
                                <div className='flex flex-col px-6 w-1/4'>
                                    <p className='text-2xl font-bold'>Finish Code</p>

                                    <Select
                                        id='editResultCode'
                                        className=' w-56 h-full text-3xl'
                                        options={resultCodeOptions}
                                        value={resultCodeOption}
                                        onChange={choice => setResultCodeOption(choice!)}
                                        styles={{
                                            control: (provided, state) =>
                                                ({
                                                    ...provided,
                                                    border: 'none',
                                                    padding: '0.5rem',
                                                    fontSize: '1rem',
                                                    borderRadius: '0.5rem',
                                                    color: 'white',
                                                    backgroundColor: theme == 'dark' ? '#27272a' : '#f4f4f5',
                                                    '&:hover': {
                                                        backgroundColor: theme == 'dark' ? '#3f3f46' : '#e4e4e7'
                                                    }
                                                } as CSSObjectWithLabel),
                                            option: (provided, state) =>
                                                ({
                                                    ...provided,
                                                    color: theme == 'dark' ? 'white' : 'black',
                                                    backgroundColor: theme == 'dark' ? (state.isSelected ? '#27272a' : '#18181b') : state.isSelected ? '#f4f4f5' : 'white',
                                                    '&:hover': {
                                                        backgroundColor: theme == 'dark' ? '#3f3f46' : '#d4d4d8'
                                                    }
                                                } as CSSObjectWithLabel),
                                            menu: (provided, state) =>
                                                ({
                                                    ...provided,
                                                    backgroundColor: theme == 'dark' ? '#18181b' : 'white',
                                                    border: theme == 'dark' ? '2px solid #3f3f46' : '2px solid #d4d4d8',
                                                    fontSize: '1rem'
                                                } as CSSObjectWithLabel),
                                            input: (provided, state) =>
                                                ({
                                                    ...provided,
                                                    color: theme == 'dark' ? 'white' : 'black'
                                                } as CSSObjectWithLabel),
                                            singleValue: (provided, state) =>
                                                ({
                                                    ...provided,
                                                    color: theme == 'dark' ? 'white' : 'black'
                                                } as CSSObjectWithLabel)
                                        }}
                                    />
                                </div>
                                {raceType == 'Handicap' ? (
                                    <div className='flex flex-col px-6 w-1/4'>
                                        <p className='text-2xl font-bold'>Position</p>

                                        {/* <Input type='number' value={handicapPosition.toString()} onValueChange={e => setHandicapPosition(parseInt(e))} /> */}
                                    </div>
                                ) : (
                                    <div className='flex flex-col px-6 w-1/4'>
                                        <p className='text-2xl font-bold'>Position</p>

                                        {/* <Input type='number' value={pursuitPosition.toString()} onValueChange={e => setPursuitPosition(parseInt(e))} /> */}
                                    </div>
                                )}

                                <div className='flex flex-row w-full'>
                                    <div className='flex flex-col px-6 w-full' key={numberLaps}>
                                        <p className='text-2xl font-bold'>Laps</p>

                                        <Input
                                            type='number'
                                            id='NumberofLaps'
                                            defaultValue={numberLaps.toString()}
                                            // onValueChange={value => {
                                            //     setNumberLaps(parseInt(value))
                                            // }}
                                        />
                                    </div>
                                    {raceType == 'Handicap' ? (
                                        <div className='flex flex-col px-6 w-full' key={basicElapsed}>
                                            <p className='text-2xl font-bold'>Finish Time</p>

                                            <Input
                                                type='time'
                                                step={'1'}
                                                defaultValue={basicElapsed}
                                                // onValueChange={value => {
                                                //     setBasicElapsed(value)
                                                // }}
                                            />
                                        </div>
                                    ) : (
                                        <div className='flex flex-col px-6 w-full' key={basicElapsed}></div>
                                    )}
                                </div>
                            </div>
                            <div className='flex flex-row mt-2 px-6'>
                                <Switch
                                    id={'AdvancedModeSwitch'}
                                    // isSelected={lapsAdvancedMode}
                                    // onValueChange={() => {
                                    //     setLapsAdvancedMode(!lapsAdvancedMode)
                                    // }}
                                />

                                <label className='text-2xl font-bold' htmlFor={'AdvancedModeSwitch'}>
                                    View Lap Data
                                </label>
                            </div>
                            {lapsAdvancedMode ? (
                                <div className='flex flex-row w-full flex-wrap' id='LapData' key={JSON.stringify(result!.laps)}>
                                    {result!.laps.map((lap: LapDataType, index: number) => {
                                        return (
                                            <div className='flex flex-col px-6 w-min' key={lap.time + index}>
                                                <p className='text-2xl font-bold p-2'>Lap {index + 1}</p>
                                                <div className='flex flex-row'>
                                                    {new Date(Math.max(0, (lap.time - fleet!.startTime) * 1000)).toISOString().substring(11, 19)}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <></>
                            )}
                        </>
                    ) : (
                        <></>
                    )}
                </div>
                <DialogFooter>
                    {advancedEdit ? (
                        <Button color='danger' onClick={() => onDelete(result!)}>
                            Remove
                        </Button>
                    ) : (
                        <></>
                    )}
                    <Button color='primary' onClick={submit}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </>
    )
}
