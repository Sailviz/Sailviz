'use client'

import { useTheme } from 'next-themes'
import { ChangeEvent, useEffect, useState } from 'react'
import * as DB from '@/components/apiMethods'
import Select, { CSSObjectWithLabel } from 'react-select'
import * as Fetcher from '@/components/Fetchers'
import { mutate } from 'swr'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

const resultCodeOptions = [
    { label: 'None', value: '' },
    { label: 'Did Not Finish', value: 'DNF' },
    { label: 'Did Not Start', value: 'DNS' },
    { label: 'Disqualified', value: 'DSQ' },
    { label: 'On Course Side', value: 'OCS' },
    { label: 'Not Sailed Course', value: 'NSC' }
]

export default function EditResultModal({
    result,
    advancedEdit,
    onSubmit,
    onDelete
}: {
    result: ResultDataType
    advancedEdit: boolean
    onSubmit: (result: ResultDataType) => void
    onDelete: (result: ResultDataType) => void
}) {
    const Router = useRouter()
    const [open, setOpen] = useState(true)
    console.log('EditResultModal', result)
    const { fleet, fleetIsError, fleetIsValidating } = Fetcher.Fleet(result.fleetId)

    const { theme, setTheme } = useTheme()
    const { boats, boatsIsError, boatsIsValidating } = Fetcher.Boats()

    const [raceType, setRaceType] = useState('Handicap')

    const [viewLaps, setViewLaps] = useState(false)
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
        if (basicElapsed == '00:00:00') {
            finishTime = 0 // if no time is set make finish time 0, effectively setting the boat to have not finished
        }
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
        console.log('EditResultModal useEffect', result, fleet)
        if (result == undefined || fleet == undefined) {
            return
        }
        const getRaceType = async () => {
            setRaceType(await DB.getRaceById(fleet.raceId).then(race => race.Type))
        }
        getRaceType()
        setHelm(result.Helm)
        setCrew(result.Crew)
        setBoat(result.boat)
        setHandicapPosition(result.HandicapPosition)
        setPursuitPosition(result.PursuitPosition)
        setSailNumber(result.SailNumber)
        setNumberLaps(result.numberLaps)
        setBasicElapsed(new Date(Math.max(0, (result.finishTime - fleet.startTime) * 1000)).toISOString().substring(11, 19))
        if (result.boat != null) {
            setBoatOption({ label: result.boat.name, value: result.boat })
        } else {
            setBoatOption({ label: '', value: {} as BoatDataType })
        }
        setResultCodeOption(result.resultCode == '' ? { label: 'None', value: '' } : { label: result.resultCode, value: result.resultCode })
    }, [result, fleet])

    return (
        <Dialog
            open={open}
            onOpenChange={open => {
                setOpen(open)
                if (!open) Router.back() // this catches the x button and clicking outside the modal, gets out of parallel route
            }}
        >
            <DialogContent className='max-w-8/12' title='Edit Result'>
                <DialogHeader className='flex flex-col gap-1 text-2xl w-96'>Edit Result</DialogHeader>
                <div className='flex flex-col w-full'>
                    <div className='flex flex-row w-full'>
                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold'>Helm</p>

                            <Input type='text' value={helm} onChange={e => setHelm(e.target.value)} />
                        </div>

                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold'>Crew</p>

                            <Input type='text' value={crew} onChange={e => setCrew(e.target.value)} placeholder=' ' />
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

                            <Input type='text' value={sailNumber} onChange={e => setSailNumber(e.target.value)} placeholder=' ' />
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

                                        <Input type='number' value={handicapPosition.toString()} onChange={e => setHandicapPosition(parseInt(e.target.value))} />
                                    </div>
                                ) : (
                                    <div className='flex flex-col px-6 w-1/4'>
                                        <p className='text-2xl font-bold'>Position</p>

                                        <Input type='number' value={pursuitPosition.toString()} onChange={e => setPursuitPosition(parseInt(e.target.value))} />
                                    </div>
                                )}

                                <div className='flex flex-row w-full'>
                                    <div className='flex flex-col px-6 w-full' key={numberLaps}>
                                        <p className='text-2xl font-bold'>Laps</p>

                                        <Input
                                            type='number'
                                            id='NumberofLaps'
                                            defaultValue={numberLaps.toString()}
                                            onChange={e => {
                                                setNumberLaps(parseInt(e.target.value))
                                            }}
                                        />
                                    </div>
                                    {raceType == 'Handicap' ? (
                                        <div className='flex flex-col px-6 w-full' key={basicElapsed}>
                                            <p className='text-2xl font-bold'>Finish Time</p>

                                            <Input
                                                type='time'
                                                step={'1'}
                                                defaultValue={basicElapsed}
                                                onBlur={e => {
                                                    setBasicElapsed(e.target.value)
                                                }}
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
                                    checked={viewLaps}
                                    onClick={() => {
                                        setViewLaps(!viewLaps)
                                    }}
                                />

                                <label className='text-2xl font-bold' htmlFor={'AdvancedModeSwitch'}>
                                    View Lap Data
                                </label>
                            </div>
                            {viewLaps ? (
                                <div className='flex flex-row w-full flex-wrap' id='LapData' key={JSON.stringify(result!.laps)}>
                                    {result.laps.map((lap: LapDataType, index: number) => {
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
        </Dialog>
    )
}
