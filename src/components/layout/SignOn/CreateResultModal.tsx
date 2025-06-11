'use client'
import { useTheme } from 'next-themes'
import { ChangeEvent, useEffect, useState } from 'react'
import Select, { CSSObjectWithLabel } from 'react-select'
import * as DB from '@/components/apiMethods'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import * as Fetcher from '@/components/Fetchers'
import { use } from 'chai'
import { mutate } from 'swr'
export default function CreateResultModal({ todaysRaces, boats }: { todaysRaces: RaceDataType[]; boats: BoatDataType[] }) {
    // const { mutateTodaysRaces } = Fetcher.GetTodaysRaceByClubId()
    const Router = useRouter()
    const [open, setOpen] = useState(true)

    const [helm, setHelm] = useState('')
    const [crew, setCrew] = useState('')
    const [sailNumber, setSailNumber] = useState('')

    const { theme, setTheme } = useTheme()
    let submitDisabled = false

    const [selectedRaces, setSelectedRaces] = useState<string[]>([])
    //array of fleets, dimensionally equal to selectedRaces
    const [selectedFleets, setSelectedFleets] = useState<string[]>([])
    const [selectedBoat, setSelectedBoat] = useState({ label: '', value: {} as BoatDataType })

    const [helmError, setHelmError] = useState(false)
    const [boatError, setBoatError] = useState(false)
    const [sailNumError, setSailNumError] = useState(false)

    let options: { label: string; value: BoatDataType }[] = []

    //set the first boat as the selected boat
    if (boats && boats.length > 0) {
        boats.forEach((boat: BoatDataType) => {
            options.push({ value: boat as BoatDataType, label: boat.name })
        })
    }

    const CapitaliseInput = (e: ChangeEvent<HTMLInputElement>) => {
        const sentence = e.target.value.split(' ')
        const cursorPos = e.target.selectionStart
        const capitalizedWords = sentence.map(word => word.charAt(0).toUpperCase() + word.slice(1))
        const capitalisedSentence = capitalizedWords.join(' ')
        if (e.target.id == 'helm') setHelm(capitalisedSentence)
        if (e.target.id == 'crew') setCrew(capitalisedSentence)
    }

    const updateRaceSelection = (race: RaceDataType, value: boolean) => {
        if (value) {
            console.log(race)
            setSelectedRaces([...new Set([...selectedRaces, race.id])])
            //add the first fleet of race to pre-select it
            setSelectedFleets([...new Set([...selectedFleets, race.fleets[0]!.id])])
        } else {
            setSelectedRaces(selectedRaces.filter(value => value != race.id))
            //remove all fleets from the selected fleets that are in this race

            setSelectedFleets(selectedFleets.filter(value => !race.fleets.flatMap(fleet => fleet.id).includes(value)))
        }
    }

    const Submit = async () => {
        //don't process submission if it's disabled
        if (submitDisabled == true) return

        //check if all fields are filled in
        submitDisabled = true
        let error = false
        if (helm == '') {
            setHelmError(true)
            error = true
        }
        if (selectedBoat.label == '') {
            setBoatError(true)
            error = true
        }
        if (sailNumber == '') {
            setSailNumError(true)
            error = true
        }
        // if not all filled in, enable submit button and return
        if (error) {
            submitDisabled = false
            return
        }
        console.log('submitting')
        console.log(selectedFleets)
        //call submit for each fleet selected
        for (let i = 0; i < selectedFleets.length; i++) {
            console.log(i)
            await createResult(selectedFleets[i]!, helm, crew, selectedBoat.value, sailNumber)
        }
        todaysRaces.forEach(race => {
            mutate(`/api/GetRaceById?id=${race.id}&results=true`)
        })
        Router.back()
    }

    const createResult = async (fleetId: string, helm: string, crew: string, boat: BoatDataType, sailNum: string) => {
        console.log('createResult', fleetId, helm, crew, boat, sailNum)
        //create a result for each fleet
        let result = await DB.createResult(fleetId)
        await DB.updateResult({ ...result, Helm: helm, Crew: crew, boat: boat, SailNumber: sailNum })

        console.log(helm, crew, boat, sailNum, fleetId)
    }

    useEffect(() => {
        console.log(todaysRaces)
    }, [todaysRaces])

    return (
        <Dialog
            open={open}
            onOpenChange={open => {
                setOpen(open)
                if (!open) Router.back() // this catches the x button and clicking outside the modal, gets out of parallel route
            }}
        >
            <DialogContent className='max-w-8/12'>
                <DialogHeader className='flex flex-col gap-1'>Create New Entry</DialogHeader>
                <div className='flex w-full'>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Helm</p>

                        <Input
                            id='helm'
                            type='text'
                            value={helm}
                            onChange={e => {
                                setHelmError(false)
                                CapitaliseInput(e)
                            }}
                            placeholder='J Bloggs'
                            autoComplete='off'
                        />
                    </div>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Crew</p>
                        <Input id='crew' type='text' value={crew} onChange={CapitaliseInput} autoComplete='off' />
                    </div>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Class</p>
                        <Select
                            id='Class'
                            className=' w-56 h-full text-3xl'
                            options={options}
                            value={selectedBoat}
                            onChange={choice => {
                                setBoatError(false)
                                setSelectedBoat(choice!)
                            }}
                            styles={{
                                control: (provided, state) =>
                                    ({
                                        ...provided,
                                        border: boatError ? '2px solid #f31260' : 'none',
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
                        <Input
                            type='text'
                            id='SailNum'
                            autoComplete='off'
                            onChange={e => {
                                setSailNumError(false)
                                setSailNumber(e.target.value)
                            }}
                        />
                    </div>
                </div>

                <div className='text-4xl font-extrabold p-6'>Select Races</div>
                {todaysRaces.map((race, index) => {
                    if (race.fleets.some(fleet => fleet.startTime != 0)) {
                        //a fleet in the race has started so don't allow entry
                        return <div key={race.id + 'finished'}></div>
                    }

                    return (
                        <div className='mx-6 mb-10' key={race.id + 'select'}>
                            <div className='flex flex-row'>
                                {race.series.name} {race.number}
                                <Switch
                                    id={race.id + 'Switch'}
                                    onCheckedChange={value => {
                                        updateRaceSelection(race, value)
                                    }}
                                    color='success'
                                />
                                <Tabs
                                    aria-label='Options'
                                    className='px-3'
                                    value={selectedFleets.find(fleetId => race.fleets.flatMap(fleet => fleet.id).includes(fleetId))}
                                    color='primary'
                                    //insert the selected fleet into the selectedFleets array at the index of the race
                                    onValueChange={key => {
                                        console.log(key.toString())
                                        // remove fleets associated with this race
                                        let arr = selectedFleets.filter(value => !race.fleets.flatMap(fleet => fleet.id).includes(value))
                                        arr.push(key.toString())
                                        setSelectedFleets(arr)
                                    }}
                                >
                                    {/* show buttons for each fleet in a series */}
                                    <TabsList>
                                        {race.fleets.map((fleet: FleetDataType, index) => {
                                            return (
                                                <TabsTrigger
                                                    key={fleet.id + 'select'}
                                                    value={fleet.id}
                                                    disabled={selectedRaces.findIndex(r => r == race.id) == -1 ? true : false}
                                                    className='data-[state=active]:bg-green-500'
                                                >
                                                    {fleet.fleetSettings.name}
                                                </TabsTrigger>
                                            )
                                        })}
                                    </TabsList>
                                </Tabs>
                                {race.Type == 'Pursuit' ? (
                                    <div className='pl-6 py-auto text-2xl font-bold text-gray-700'>
                                        Start Time: {String(Math.floor((selectedBoat.value.pursuitStartTime || 0) / 60)).padStart(2, '0')}:
                                        {String((selectedBoat.value.pursuitStartTime || 0) % 60).padStart(2, '0')}
                                    </div>
                                ) : (
                                    <></>
                                )}
                            </div>
                        </div>
                    )
                })}
                <DialogFooter>
                    <Button color='success' onClick={Submit}>
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
