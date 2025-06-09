'use client'
import React, { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, RowSelection, SortingState, useReactTable } from '@tanstack/react-table'

import { EyeIcon } from '@/components/icons/eye-icon'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import * as Fetcher from '@/components/Fetchers'
import useSWR, { mutate } from 'swr'
import { useSession } from 'next-auth/react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { Session } from 'next-auth'

const Time = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)

    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])
    return (
        <>
            <div>{dayjs(value).format('D MMMM h:mm A')}</div>
        </>
    )
}

const Race = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)

    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])
    return (
        <>
            <div>{value.name}</div>
        </>
    )
}

const Action = ({ ...props }: any) => {
    const Router = useRouter()

    return (
        <Link href={`${props.viewHref}${props.row.original.id}`} className='text-default-900 cursor-pointer'>
            <Button variant='outline' className='w-16 h-8 p-0'>
                Open
            </Button>
        </Link>
    )
}

const columnHelper = createColumnHelper<RaceDataType>()

const RacesTable = ({ date, historical, viewHref, clubId }: { date: Date; historical: boolean; viewHref: string; clubId: string }) => {
    const [page, setPage] = useState(1)
    const {
        data: races,
        error: racesIsError,
        isValidating: racesIsValidating
    } = useSWR(`/api/GetRacesByClubId?id=${clubId || ''}&page=${page}&date=${date}&historical=${historical}`, Fetcher.fetcher)

    const [data, setData] = useState<RaceDataType[]>([])
    const [count, setCount] = useState(0)
    const rowsPerPage = 10

    const pages = useMemo(() => {
        return count ? Math.ceil(count / rowsPerPage) : 0
    }, [count, rowsPerPage])

    const loadingState = racesIsValidating || data == undefined ? 'loading' : 'idle'

    useEffect(() => {
        console.log(races)
        if (races) {
            setData(races.races)
            setCount(races.count)
        }
    }, [races])

    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor(data => data.series, {
                id: 'Race',
                cell: props => <Race {...props} />
            }),
            columnHelper.accessor('number', {
                header: 'Number',
                cell: info => info.getValue().toString(),
                enableSorting: true
            }),
            columnHelper.accessor('Time', {
                header: 'Date/Time',
                cell: props => <Time {...props} />
            }),
            columnHelper.accessor('id', {
                id: 'action',
                header: 'Actions',
                cell: props => <Action {...props} id={props.row.original.id} viewHref={viewHref} />
            })
        ],
        getCoreRowModel: getCoreRowModel()
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
            <div className='flex items-center justify-end space-x-2 py-4'>
                <div className='space-x-2'>
                    <Button variant='outline' size='sm' onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                        Previous
                    </Button>
                    <Button variant='outline' size='sm' onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default RacesTable
