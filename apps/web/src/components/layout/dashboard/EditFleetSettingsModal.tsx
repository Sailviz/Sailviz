import { useEffect, useState } from 'react'
import Select from 'react-select'
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { DialogTrigger } from '@radix-ui/react-dialog'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import * as Types from '@sailviz/types'
export default function EditFleetSettingsDialog({ fleetSettings, seriesId }: { fleetSettings: Types.FleetSettingsType; seriesId: string }) {
    const { data: boats } = useQuery(orpcClient.boat.org.session.queryOptions())
    const { data: flags } = useQuery(orpcClient.flag.org.all.queryOptions())

    const updateFleetSettingsMutation = useMutation(orpcClient.fleet.settings.update.mutationOptions())
    const queryClient = useQueryClient()

    const [name, setName] = useState('')
    const [start, setStart] = useState(0)
    const [selectedBoats, setSelectedBoats] = useState([{ label: '', value: {} as Types.BoatType }])
    const [options, setOptions] = useState([{ label: '', value: {} as Types.BoatType }])

    const [flagOptions, setFlagOptions] = useState([{ label: '', value: {} as Types.Flag }])
    const [selectedClassFlag, setSelectedClassFlag] = useState({ label: '', value: {} as Types.Flag })
    const [selectedPreparatoryFlag, setSelectedPreparatoryFlag] = useState({ label: '', value: {} as Types.Flag })

    const [open, setOpen] = useState(false)

    const onSubmit = async (fleetSettings: Types.FleetSettingsType) => {
        await updateFleetSettingsMutation.mutateAsync(fleetSettings)
        console.log(seriesId)
        queryClient.invalidateQueries({
            queryKey: orpcClient.fleet.settings.find.key({ type: 'query' })
        })
        setOpen(false)
    }

    useEffect(() => {
        if (fleetSettings == undefined) return
        console.log(fleetSettings)
        setName(fleetSettings.name)
        setStart(fleetSettings.start)
        setSelectedBoats(fleetSettings.boats.map(x => ({ value: x, label: x.name })))
        setSelectedClassFlag({ value: fleetSettings.classFlag, label: fleetSettings.classFlag.name })
        setSelectedPreparatoryFlag({ value: fleetSettings.preparatoryFlag, label: fleetSettings.preparatoryFlag.name })
    }, [fleetSettings])

    useEffect(() => {
        if (boats === undefined) return
        let tempoptions: { label: string; value: Types.BoatType }[] = []
        boats.forEach(boat => {
            // Check if the boat is already selected
            if (selectedBoats.find(x => x.value.id === boat.id)) return
            tempoptions.push({ value: boat as Types.BoatType, label: boat.name })
        })
        setOptions(tempoptions)
    }, [boats, selectedBoats])

    useEffect(() => {
        if (flags === undefined) return
        let tempoptions: { label: string; value: Types.Flag }[] = []
        flags.forEach(boat => {
            // Check if the boat is already selected
            tempoptions.push({ value: boat as Types.Flag, label: boat.name })
        })
        setFlagOptions(tempoptions)
    }, [flags])

    return (
        <Dialog
            open={open}
            onOpenChange={open => {
                setOpen(open)
            }}
        >
            <DialogTrigger asChild>
                <Button aria-label='edit fleet' color='secondary'>
                    Edit Fleet
                </Button>
            </DialogTrigger>
            <DialogContent className='max-w-8/12'>
                <DialogTitle>Edit Fleet</DialogTitle>
                <div className='flex w-full'>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Name</p>
                        <Input type='text' value={name} onChange={e => setName(e.target.value)} />
                    </div>
                </div>
                <div className='flex w-full'>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Start</p>
                        <Input type='text' value={start} onChange={e => setStart(parseInt(e.target.value))} />
                    </div>
                </div>
                <p className='text-6xl font-extrabold p-6'>Flags</p>
                <div className='flex w-full flex-row'>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Class</p>
                        <div className='w-full p-2 mx-0 my-2'>
                            <Select
                                id='editClass'
                                className=' w-full h-full text-3xl'
                                options={flagOptions}
                                isMulti={false}
                                isClearable={false}
                                value={selectedClassFlag}
                                onChange={choice => setSelectedClassFlag(choice!)}
                            />
                        </div>
                    </div>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Preparatory</p>
                        <div className='w-full p-2 mx-0 my-2'>
                            <Select
                                id='editClass'
                                className=' w-full h-full text-3xl'
                                options={flagOptions}
                                isMulti={false}
                                isClearable={false}
                                value={selectedPreparatoryFlag}
                                onChange={choice => setSelectedPreparatoryFlag(choice!)}
                            />
                        </div>
                    </div>
                </div>
                <div>
                    <p className='text-6xl font-extrabold p-6'>Boats</p>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Class</p>
                        <div className='w-full p-2 mx-0 my-2'>
                            <Select
                                id='editClass'
                                className=' w-full h-full text-3xl'
                                options={options}
                                isMulti={true}
                                isClearable={false}
                                value={selectedBoats}
                                onChange={choice => setSelectedBoats(choice! as [])}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        color='primary'
                        onClick={() =>
                            onSubmit({
                                ...fleetSettings!,
                                name: name,
                                boats: selectedBoats.flatMap(boats => boats.value),
                                start: start,
                                classFlag: selectedClassFlag.value,
                                preparatoryFlag: selectedPreparatoryFlag.value
                            })
                        }
                    >
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
