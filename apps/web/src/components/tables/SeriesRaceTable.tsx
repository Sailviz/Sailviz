'use client'
import React, { useState } from 'react'
import dayjs from 'dayjs'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, type SortingState, useReactTable } from '@tanstack/react-table'
import * as DB from '@components/apiMethods'
import { useLoaderData, useNavigate } from '@tanstack/react-router'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@components/helpers/users'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import type { RaceType } from '@sailviz/types'

const raceOptions = [
    { value: 'Pursuit', label: 'Pursuit' },
    { value: 'Handicap', label: 'Handicap' }
]

const Time = ({ initialValue, race }: { initialValue: any; race: RaceDataType }) => {
    const [value, setValue] = React.useState(initialValue)

    const onBlur = () => {
        console.log(value)
        var time = value.replace('T', ' ')
        var day = dayjs(time)
        if (day.isValid()) {
            race.Time = time
            DB.updateRaceById(race)
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

const Type = ({ initialValue, race }: { initialValue: any; race: RaceDataType }) => {
    const [value, setValue] = React.useState(initialValue)

    const onBlur = (type: string) => {
        race.Type = type
        DB.updateRaceById(race)
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

const Action = ({ id, user }: { id: string; user: UserDataType }) => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const onDeleteClick = async () => {
        if (confirm('are you sure you want to do this?')) {
            let result = await DB.deleteRaceById(id)
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

    const { data: series } = useQuery(orpcClient.series.find.queryOptions({ input: { seriesId: seriesId } }))

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
