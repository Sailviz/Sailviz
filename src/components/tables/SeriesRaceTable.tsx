'use client'
import React, { ChangeEvent, useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, RowSelection, SortingState, useReactTable } from '@tanstack/react-table'
import * as DB from '@/components/apiMethods'
import { VerticalDotsIcon } from '@/components/icons/vertical-dots-icon'
import { EyeIcon } from '@/components/icons/eye-icon'
import { EditIcon } from '@/components/icons/edit-icon'
import { DeleteIcon } from '@/components/icons/delete-icon'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import useSWR from 'swr'
import * as Fetcher from '@/components/Fetchers'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@/components/helpers/users'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useSession } from '@/lib/auth-client'

const raceOptions = [
    { value: 'Pursuit', label: 'Pursuit' },
    { value: 'Handicap', label: 'Handicap' }
]

const Time = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)

    const onBlur = () => {
        console.log(value)
        var raceData: RaceDataType = props.row.original
        console.log(raceData.id)
        var time = value.replace('T', ' ')
        var day = dayjs(time)
        if (day.isValid()) {
            raceData.Time = time
            DB.updateRaceById(raceData)
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

const Type = ({ ...props }: any) => {
    const { theme, setTheme } = useTheme()
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)

    const onBlur = (type: string) => {
        var raceData: RaceDataType = props.row.original
        console.log(raceData.id)

        raceData.Type = type
        DB.updateRaceById(raceData)
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

const Action = ({ ...props }: any) => {
    const Router = useRouter()

    const onDeleteClick = async () => {
        if (confirm('are you sure you want to do this?')) {
            let result = await DB.deleteRaceById(props.row.original.id)
            if (!result) {
                return
            } // failed to delete race
        }
    }
    return (
        <div className='relative flex items-center gap-2'>
            <EyeIcon className={'cursor-pointer'} onClick={() => Router.push('/Race/' + props.row.original.id)} />

            {userHasPermission(props.user, AVAILABLE_PERMISSIONS.editRaces) ? (
                <>
                    <DeleteIcon onClick={onDeleteClick} className={'cursor-pointer text-red-500'} />
                </>
            ) : (
                <></>
            )}
        </div>
    )
}

const columnHelper = createColumnHelper<RaceDataType>()

const SeriesRaceTable = (props: any) => {
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()
    const [seriesId, setSeriesId] = useState(props.id)
    const {
        data: series,
        error: seriesIsError,
        isValidating: seriesIsValidating
    } = useSWR(`/api/GetSeriesById?id=${seriesId}`, Fetcher.fetcher, { fallbackData: {} as SeriesDataType })

    let data = series.races
    if (data == undefined) {
        data = []
    }

    const loadingState = seriesIsValidating ? 'loading' : 'idle'

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
                cell: props => <Time {...props} />
            }),
            columnHelper.accessor('Type', {
                id: 'Type',
                cell: props => <Type {...props} />
            }),
            columnHelper.accessor('id', {
                id: 'action',
                header: 'Actions',
                cell: props => <Action {...props} id={props.row.original.id} user={session!.user} />
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
