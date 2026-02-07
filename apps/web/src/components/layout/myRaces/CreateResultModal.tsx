import { useTheme } from 'next-themes'
import { type ChangeEvent, useEffect, useState } from 'react'
import Select, { type CSSObjectWithLabel } from 'react-select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from '@components/ui/dialog'
import { Input } from '@components/ui/input'
import { Switch } from '@components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@components/ui/tabs'
import { Button } from '@components/ui/button'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import * as Types from '@sailviz/types'

export default function CreateResultModal({ org }: { org: Types.Org }) {
    const { data: boats } = useQuery(orpcClient.boat.org.all.queryOptions({ input: { orgId: org.id } }))
    const { data: trackers } = useQuery({
        ...orpcClient.trackable.device.list.queryOptions({
            input: { orgId: org?.metadata?.trackable?.orgId || '' }
        }),
        enabled: org instanceof Promise
    })

    const { data: signOnProfiles } = useQuery(orpcClient.user.signOnProfile.all.queryOptions())
    const { data: todaysRaces } = useQuery(orpcClient.race.today.queryOptions({ input: { orgId: org.id } }))
    const createResultMutation = useMutation(orpcClient.result.create.mutationOptions())
    const updateResultMutation = useMutation(orpcClient.result.update.mutationOptions())
    const createParticipantMutation = useMutation(orpcClient.trackable.participant.create.mutationOptions())

    const [open, setOpen] = useState(false)
    const [helm, setHelm] = useState('')
    const [crew, setCrew] = useState('')
    const [sailNumber, setSailNumber] = useState('')
    const [trackerId, setTrackerId] = useState('')

    const queryClient = useQueryClient()

    const { theme } = useTheme()
    let submitDisabled = false

    const [selectedRaces, setSelectedRaces] = useState<string[]>([])
    //array of fleets, dimensionally equal to selectedRaces
    const [selectedFleets, setSelectedFleets] = useState<string[]>([])
    const [selectedBoat, setSelectedBoat] = useState({ label: '', value: {} as Types.BoatType })

    const [helmError, setHelmError] = useState(false)
    const [boatError, setBoatError] = useState(false)
    const [sailNumError, setSailNumError] = useState(false)

    let options: { label: string; value: Types.BoatType }[] = []

    //set the first boat as the selected boat
    if (boats && boats.length > 0) {
        boats.forEach((boat: Types.BoatType) => {
            options.push({ value: boat as Types.BoatType, label: boat.name })
        })
    }

    const CapitaliseInput = (e: ChangeEvent<HTMLInputElement>) => {
        const sentence = e.target.value.split(' ')
        const capitalizedWords = sentence.map(word => word.charAt(0).toUpperCase() + word.slice(1))
        const capitalisedSentence = capitalizedWords.join(' ')
        if (e.target.id == 'helm') setHelm(capitalisedSentence)
        if (e.target.id == 'crew') setCrew(capitalisedSentence)
    }

    const updateRaceSelection = (race: Types.RaceType, value: boolean) => {
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
        //check that at least one fleet is selected
        console.log(selectedFleets.length)
        if (selectedFleets.length <= 0) {
            alert('Please select at least one race')
            error = true
        }
        // if not all filled in, enable submit button and return
        if (error) {
            submitDisabled = false
            return
        }

        //call submit for each fleet selected
        for (let i = 0; i < selectedFleets.length; i++) {
            //create the participant in trackable.
            let participantId = ''
            if (trackerId != '') {
                const race = todaysRaces?.filter(race => race.fleets.some(f => f.id == selectedFleets[i]))[0]!
                console.log(race)
                if (race.trackableEventId != null) {
                    const participant = await createParticipantMutation.mutateAsync({ eventId: race.trackableEventId, deviceId: trackerId })
                    participantId = participant.id
                } else {
                    console.log("trackable event id is null, can't create participant")
                }
            }
            await createResult(selectedFleets[i]!, helm, crew, selectedBoat.value, sailNumber, participantId)
        }
        todaysRaces?.forEach(race => {
            queryClient.invalidateQueries({
                queryKey: orpcClient.race.find.key({ type: 'query', input: { raceId: race.id } })
            })
        })

        setOpen(false)
    }

    const createResult = async (fleetId: string, helm: string, crew: string, boat: Types.BoatType, sailNum: string, participantId: string) => {
        console.log('createResult', fleetId, helm, crew, boat, sailNum)
        //create a result for each fleet
        let result = await createResultMutation.mutateAsync({ fleetId: fleetId })
        await updateResultMutation.mutateAsync({ ...result, Helm: helm, Crew: crew, boat: boat, SailNumber: sailNum, trackableParticipantId: participantId })

        console.log(helm, crew, boat, sailNum, fleetId)
    }

    const clearFields = async () => {
        console.log('clearing fields')
        setHelm('')
        setCrew('')
        setTrackerId('')
        setSailNumber('')
        setSelectedRaces([])
        setSelectedFleets([])
        setSelectedBoat({ label: '', value: {} as Types.BoatType })
        submitDisabled = false
    }

    useEffect(() => {
        console.log(todaysRaces)
    }, [todaysRaces])

    return (
        <Dialog
            open={open}
            onOpenChange={e => {
                clearFields()
                setOpen(e)
            }}
        >
            <DialogTrigger asChild>
                <Button variant={'green'} size={'big'} aria-label='add entry'>
                    Add Entry
                </Button>
            </DialogTrigger>
            <DialogContent className='max-w-full'>
                <DialogHeader className='flex flex-col gap-1'>Create New Entry</DialogHeader>
                {signOnProfiles?.map(profile => {
                    return (
                        <div
                            key={profile.id}
                            className='cursor-pointer bg-gray-300 p-2 rounded-lg mb-2 border border-black'
                            onClick={() => {
                                setHelm(profile.Helm)
                                setCrew(profile.Crew)
                                setSailNumber(profile.SailNumber)
                                setSelectedBoat({ label: profile.Boat.name, value: boats?.find(boat => boat.id == profile.Boat.id) as Types.BoatType })
                            }}
                        >
                            <p>
                                {profile.Helm} {profile.Crew} {profile.Boat.name} {profile.SailNumber}
                            </p>
                        </div>
                    )
                })}
                <div className='flex w-full flex-col md:flex-row'>
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
                            isInvalid={helmError}
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
                            className=' w-56 text-3xl'
                            options={options}
                            value={selectedBoat}
                            onChange={choice => {
                                setBoatError(false)
                                setSelectedBoat(choice!)
                            }}
                            styles={{
                                control: provided =>
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
                                    }) as CSSObjectWithLabel,
                                option: (provided, state) =>
                                    ({
                                        ...provided,
                                        color: theme == 'dark' ? 'white' : 'black',
                                        backgroundColor: theme == 'dark' ? (state.isSelected ? '#27272a' : '#18181b') : state.isSelected ? '#f4f4f5' : 'white',
                                        '&:hover': {
                                            backgroundColor: theme == 'dark' ? '#3f3f46' : '#d4d4d8'
                                        }
                                    }) as CSSObjectWithLabel,
                                menu: provided =>
                                    ({
                                        ...provided,
                                        backgroundColor: theme == 'dark' ? '#18181b' : 'white',
                                        border: theme == 'dark' ? '2px solid #3f3f46' : '2px solid #d4d4d8',
                                        fontSize: '1rem'
                                    }) as CSSObjectWithLabel,
                                input: provided =>
                                    ({
                                        ...provided,
                                        color: theme == 'dark' ? 'white' : 'black'
                                    }) as CSSObjectWithLabel,
                                singleValue: provided =>
                                    ({
                                        ...provided,
                                        color: theme == 'dark' ? 'white' : 'black'
                                    }) as CSSObjectWithLabel
                            }}
                        />
                    </div>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Sail Number</p>
                        <Input
                            type='text'
                            id='SailNum'
                            autoComplete='off'
                            value={sailNumber}
                            onChange={e => {
                                setSailNumError(false)
                                setSailNumber(e.target.value)
                            }}
                            isInvalid={sailNumError}
                        />
                    </div>
                </div>
                <div className='flex flex-col px-6'>
                    <p className='text-2xl font-bold'>Tracker ID</p>
                    <Select<{ label: string; value: string }>
                        id='trackerId'
                        className=' w-56 text-3xl'
                        options={trackers?.map(tracker => {
                            return { label: tracker.name, value: tracker.id }
                        })}
                        value={{ label: trackers?.find(t => t.id === trackerId)?.name || '', value: trackerId }}
                        onChange={choice => {
                            setBoatError(false)
                            setTrackerId(choice!.value)
                        }}
                        styles={{
                            control: provided =>
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
                                }) as CSSObjectWithLabel,
                            option: (provided, state) =>
                                ({
                                    ...provided,
                                    color: theme == 'dark' ? 'white' : 'black',
                                    backgroundColor: theme == 'dark' ? (state.isSelected ? '#27272a' : '#18181b') : state.isSelected ? '#f4f4f5' : 'white',
                                    '&:hover': {
                                        backgroundColor: theme == 'dark' ? '#3f3f46' : '#d4d4d8'
                                    }
                                }) as CSSObjectWithLabel,
                            menu: provided =>
                                ({
                                    ...provided,
                                    backgroundColor: theme == 'dark' ? '#18181b' : 'white',
                                    border: theme == 'dark' ? '2px solid #3f3f46' : '2px solid #d4d4d8',
                                    fontSize: '1rem'
                                }) as CSSObjectWithLabel,
                            input: provided =>
                                ({
                                    ...provided,
                                    color: theme == 'dark' ? 'white' : 'black'
                                }) as CSSObjectWithLabel,
                            singleValue: provided =>
                                ({
                                    ...provided,
                                    color: theme == 'dark' ? 'white' : 'black'
                                }) as CSSObjectWithLabel
                        }}
                    />
                </div>
                <div className='flex flex-col flex-2'>
                    <div className='text-4xl font-extrabold p-6'>Select Races</div>
                    {todaysRaces?.map(race => {
                        if (race.fleets.some(fleet => fleet.startTime != 0)) {
                            //a fleet in the race has started so don't allow entry
                            return <div key={race.id + 'finished'}></div>
                        }

                        return (
                            <div className='mb-10' key={race.id + 'select'}>
                                <div className='flex flex-row'>
                                    <div className='py-2 font-bold px-4'>
                                        {race.series!.name} {race.number}
                                    </div>
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
                                            {race.fleets.map((fleet: Types.FleetType) => {
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
                </div>
                <DialogFooter>
                    <Button color='success' onClick={Submit}>
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
