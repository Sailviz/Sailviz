import React, { useState } from 'react'
import dayjs from 'dayjs'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, type SortingState, useReactTable } from '@tanstack/react-table'
import { useLoaderData, useNavigate } from '@tanstack/react-router'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@components/helpers/users'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import type { RaceType, SeriesType, UserType } from '@sailviz/types'

const raceOptions = [
    { value: 'Pursuit', label: 'Pursuit' },
    { value: 'Handicap', label: 'Handicap' }
]

const Time = ({ initialValue, race }: { initialValue: any; race: RaceType }) => {
    const [value, setValue] = React.useState(initialValue)

    const updateRace = useMutation(orpcClient.race.update.mutationOptions())

    const onBlur = () => {
        console.log(value)
        var time = value.replace('T', ' ')
        var day = dayjs(time)
        if (day.isValid()) {
            race.Time = time
            updateRace.mutateAsync(race)
        }
    }

    React.useEffect(() => {
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

const Type = ({ initialValue, race }: { initialValue: any; race: RaceType }) => {
    const [value, setValue] = React.useState(initialValue)

    const updateRace = useMutation(orpcClient.race.update.mutationOptions())

    const onBlur = (type: string) => {
        race.Type = type
        updateRace.mutateAsync(race)
    }

    React.useEffect(() => {
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

const Action = ({ id, user }: { id: string; user: UserType }) => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const deleteRace = useMutation(orpcClient.race.delete.mutationOptions())

    const onDeleteClick = async () => {
        if (confirm('are you sure you want to do this?')) {
            const result = deleteRace.mutateAsync({ raceId: id })
            if (!result) {
                return
            }
            queryClient.invalidateQueries({ queryKey: orpcClient.series.find.key({ type: 'query' }) })
        }
    }
    return (
        <div className='relative flex items-center gap-2'>
            <Button onClick={() => navigate({ to: '/Race/' + id })}>View</Button>

            {userHasPermission(user, AVAILABLE_PERMISSIONS.editRaces) ? (
                <>
                    <Button onClick={onDeleteClick} variant={'outline'}>
                        Remove
                    </Button>
                </>
            ) : (
                <></>
            )}
        </div>
    )
}

const columnHelper = createColumnHelper<RaceType>()

const SeriesRaceTable = ({ seriesId }: { seriesId: string }) => {
    const session = useLoaderData({ from: `__root__` })

    const series = useQuery(orpcClient.series.find.queryOptions({ input: { seriesId: seriesId } })).data as SeriesType

    const data = series?.races || []
    const [sorting, setSorting] = useState<SortingState>([
        {
            id: 'number',
            desc: false
        }
    ])

    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('number', {
                id: 'number',
                cell: info => info.getValue(),
                enableSorting: true
            }),
            columnHelper.accessor('Time', {
                id: 'Number of Races',
                cell: props => <Time initialValue={props.getValue()} race={props.row.original} />
            }),
            columnHelper.accessor('Type', {
                id: 'Type',
                cell: props => <Type initialValue={props.getValue()} race={props.row.original} />
            }),
            columnHelper.accessor('id', {
                id: 'action',
                header: 'Actions',
                cell: props => <Action id={props.row.original.id} user={session!.user} />
            })
        ],
        state: {
            sorting
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel()
    })
    return (
        <div className='w-full'>
            <div className='rounded-md border'>
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
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell className='h-24 text-center'>No results.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default SeriesRaceTable
