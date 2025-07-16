import { useTheme } from 'next-themes'
import { ChangeEvent, useEffect, useState } from 'react'
import Select from 'react-select'
import * as Fetcher from '@/components/Fetchers'
import { PERMISSIONS } from '@/components/helpers/users'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { DialogTrigger } from '@radix-ui/react-dialog'
import * as DB from '@/components/apiMethods'
import { mutate } from 'swr'

export default function EditFleetSettingsDialog({ fleetSettings, seriesId }: { fleetSettings: FleetSettingsType; seriesId: string }) {
    const Router = useRouter()
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { boats, boatsIsError, boatsIsValidating } = Fetcher.Boats()

    const [name, setName] = useState('')
    const [selectedBoats, setSelectedBoats] = useState([{ label: '', value: {} as BoatDataType }])
    const [options, setOptions] = useState([{ label: '', value: {} as BoatDataType }])

    const [open, setOpen] = useState(false)

    const onSubmit = async (fleetSettings: FleetSettingsType) => {
        await DB.updateFleetSettingsById(fleetSettings)
        console.log(seriesId)
        mutate(`/api/GetFleetSettingsBySeriesId?id=${seriesId}`)
        setOpen(false)
    }

    useEffect(() => {
        if (fleetSettings == undefined) return
        console.log(fleetSettings)
        setName(fleetSettings.name)
        setSelectedBoats(fleetSettings.boats.map(x => ({ value: x, label: x.name })))
    }, [fleetSettings])

    useEffect(() => {
        if (boats === undefined) return
        let tempoptions: { label: string; value: BoatDataType }[] = []
        boats.forEach(boat => {
            tempoptions.push({ value: boat as BoatDataType, label: boat.name })
        })
        setOptions(tempoptions)
    }, [boats])
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
                <DialogHeader className='flex flex-col gap-1'>Edit Fleet</DialogHeader>
                <div className='flex w-full'>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Name</p>
                        <Input type='text' value={name} onChange={e => setName(e.target.value)} />
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
                    <Button color='primary' onClick={() => onSubmit({ ...fleetSettings!, name: name, boats: selectedBoats.flatMap(boats => boats.value) })}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
