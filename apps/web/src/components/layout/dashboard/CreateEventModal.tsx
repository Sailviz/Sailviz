import { Button } from '@components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from '@components/ui/dialog'
import { Input } from '@components/ui/input'
import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'
import dayjs from 'dayjs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table'
import { createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table'
import { getFiveStartSequence, getThreeStartSequence } from '@components/helpers/startSequence'
import { useLoaderData } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import type { RaceType } from '@sailviz/types'
import type { Session } from '@sailviz/auth/client'

type Race = {
    number: number
    time: string
    type: string
}

const raceOptions = [
    { value: 'Pursuit', label: 'Pursuit' },
    { value: 'Handicap', label: 'Handicap' }
]

const startSequenceOptions = [
    { value: 'Five', label: '5 4 1 0' },
    { value: 'Three', label: '3 2 1 0' }
]

const Text = ({ value }: { value: string }) => {
    return <div>{value}</div>
}

const Time = ({ initialValue, race, updateTime }: { initialValue: any; race: Race; updateTime: (number: number, time: string) => void }) => {
    const [value, setValue] = useState(initialValue)

    const onBlur = () => {
        console.log(value)
        var time = value.replace('T', ' ')
        var day = dayjs(time)
        if (day.isValid()) {
            updateTime(race.number, time)
        }
    }

    useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    return (
        <>
            <Input
                type='datetime-local'
                id='Time'
                className='w-full'
                value={dayjs(value).format('YYYY-MM-DDTHH:mm')}
                onChange={e => setValue(e.target.value)}
                onBlur={onBlur}
            />
        </>
    )
}

const Type = ({ initialValue, race, updateType }: { initialValue: any; race: Race; updateType: (number: number, type: string) => void }) => {
    const [value, setValue] = useState(initialValue)

    const onBlur = (type: string) => {
        race.type = type
        updateType(race.number, type)
    }

    useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    return (
        <>
            <Select
                value={value}
                onValueChange={(value: string) => {
                    setValue(value)
                    onBlur(value)
                }}
            >
                <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select Type' />
                </SelectTrigger>
                <SelectContent>
                    {raceOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </>
    )
}

const Action = ({ number, removeRace }: { number: number; removeRace: any }) => {
    const onDeleteClick = async () => {
        removeRace(number)
    }
    return (
        <div className='relative flex items-center gap-2'>
            <Button onClick={onDeleteClick} variant={'outline'}>
                Remove
            </Button>
        </div>
    )
}
const columnHelper = createColumnHelper<Race>()

export default function CreateEventDialog() {
    const session: Session = useLoaderData({ from: `__root__` })

    const [races, setRaces] = useState<Race[]>([{ number: 1, time: dayjs().format('YYYY-MM-DD HH:mm'), type: 'Handicap' }])
    const [name, setName] = useState('New Series')
    const [startSequence, setStartSequence] = useState('Five')

    const [open, setOpen] = useState(false)

    const createSeriesMutation = useMutation(orpcClient.series.create.mutationOptions())
    const findSeriesMutation = useMutation(orpcClient.series.find.mutationOptions())
    const updateStartSequenceMutation = useMutation(orpcClient.startSequence.update.mutationOptions())
    const createRaceMutation = useMutation(orpcClient.race.create.mutationOptions())
    const updateRaceMutation = useMutation(orpcClient.race.update.mutationOptions())

    const addRace = () => {
        //these aren't actually the numbers that the race will get as they are assigned in the api.
        setRaces([...races, { number: races.length + 1, time: dayjs().format('YYYY-MM-DD HH:mm'), type: 'Handicap' }])
    }

    const removeRace = (number: number) => {
        setRaces((prevRaces: Race[]) => prevRaces.filter((r: Race) => r.number !== number))
    }

    const updateTime = (number: number, time: string) => {
        setRaces(prevRaces =>
            prevRaces.map(r => {
                if (r.number === number) {
                    return { ...r, time: time }
                }
                return r
            })
        )
    }

    const updateType = (number: number, type: string) => {
        setRaces(prevRaces =>
            prevRaces.map(r => {
                if (r.number === number) {
                    return { ...r, type: type }
                }
                return r
            })
        )
    }

    const createEvent = async (events: Race[]) => {
        console.log('Creating event', events)
        //create series
        const res = await createSeriesMutation.mutateAsync({ orgId: session.session.activeOrganizationId!, name: name }) // this adds a single fleet to the series by default
        if (!res) {
            console.error('Failed to create series')
            return
        }
        console.log('Created series', res)
        const series = await findSeriesMutation.mutateAsync({ seriesId: res.id })
        if (!series) {
            console.error('Failed to fetch series after creation')
            return
        }
        console.log('Fetched series', series)
        // set start sequence for series
        if (startSequence === 'Five') {
            await updateStartSequenceMutation.mutateAsync({ seriesId: series.id, startSequence: getFiveStartSequence(series.fleetSettings[0]?.id || '') })
        } else if (startSequence === 'Three') {
            await updateStartSequenceMutation.mutateAsync({ seriesId: series.id, startSequence: getThreeStartSequence(series.fleetSettings[0]?.id || '') })
        } else {
            console.error('Invalid start sequence')
            return
        }
        //create each race
        for (const event of events) {
            const dbrace: RaceType = await createRaceMutation.mutateAsync({ seriesId: series.id })
            //update race with details
            dbrace.Type = event.type
            dbrace.Time = event.time

            await updateRaceMutation.mutateAsync(dbrace)
        }

        setOpen(false)
    }

    var table = useReactTable({
        data: races,
        columns: [
            columnHelper.accessor('number', {
                header: 'Number',
                cell: props => <Text value={props.getValue()} />,
                enableColumnFilter: true
            }),
            columnHelper.accessor('time', {
                header: 'Time',
                cell: props => <Time initialValue={props.getValue()} race={props.row.original} updateTime={updateTime} />,
                enableColumnFilter: false
            }),
            columnHelper.accessor('type', {
                id: 'py',
                header: 'Type',
                cell: props => <Type initialValue={props.getValue()} race={props.row.original} updateType={updateType} />,
                enableColumnFilter: false
            }),
            columnHelper.accessor('number', {
                id: 'action',
                header: 'Actions',
                cell: props => <Action number={props.getValue()} removeRace={removeRace} />
            })
        ],
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel()
    })

    return (
        <Dialog
            open={open}
            onOpenChange={open => {
                setOpen(open)
            }}
        >
            <DialogTrigger asChild aria-label='new event'>
                <Button>Create New Event</Button>
            </DialogTrigger>
            <DialogContent className='max-w-8/12'>
                <DialogTitle className='flex flex-col gap-1'>Create New Event</DialogTitle>
                <div className='flex flex-row w-full'>
                    <p className='text-2xl font-bold'>Name</p>

                    <Input type='text' className='mx-4 w-1/4' value={name} onChange={e => setName(e.target.value)} />
                    <p className='text-2xl font-bold  text-nowrap'>Start Sequence</p>

                    <Select
                        value={startSequence}
                        onValueChange={(value: string) => {
                            setStartSequence(value)
                        }}
                    >
                        <SelectTrigger className='w-1/4 mx-4'>
                            <SelectValue placeholder='Select Type' />
                        </SelectTrigger>
                        <SelectContent>
                            {startSequenceOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => {
                                    return (
                                        <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map(row => (
                            <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className='cursor-pointer'>
                                {row.getVisibleCells().map(cell => (
                                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Button onClick={() => addRace()}>Add Race</Button>
                <DialogFooter>
                    <Button color='primary' onClick={() => createEvent(races)}>
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
