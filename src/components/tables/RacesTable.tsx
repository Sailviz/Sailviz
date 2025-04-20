'use client'
import React, { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, RowSelection, SortingState, useReactTable } from '@tanstack/react-table'
import {
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Dropdown,
    DropdownItem,
    DropdownTrigger,
    Button,
    DropdownMenu,
    Input,
    Tooltip,
    Pagination,
    Spinner
} from '@nextui-org/react'
import { EyeIcon } from '@/components/icons/eye-icon'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import * as Fetcher from '@/components/Fetchers'
import useSWR, { mutate } from 'swr'

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
        <div className='relative flex items-center gap-2'>
            <Tooltip content='View'>
                <span className='text-lg text-default-400 cursor-pointer active:opacity-50'>
                    <EyeIcon onClick={() => props.viewRace(props.row.original.id)} />
                </span>
            </Tooltip>
        </div>
    )
}

const columnHelper = createColumnHelper<NextRaceDataType>()

const RacesTable = (props: any) => {
    const [club, setClub] = useState(props.club)
    const [page, setPage] = useState(1)
    const {
        data: races,
        error: racesIsError,
        isValidating: racesIsValidating
    } = useSWR(`/api/GetRacesByClubId?id=${club.id}&page=${page}&date=${props.date}&historical=${props.historical}`, Fetcher.fetcher, {
        keepPreviousData: true,
        suspense: true
    })

    const data = races.races
    const count = races?.count
    const rowsPerPage = 10

    const viewRace = (raceId: string) => {
        props.viewRace(raceId)
    }

    const pages = useMemo(() => {
        return count ? Math.ceil(count / rowsPerPage) : 0
    }, [count, rowsPerPage])

    const loadingState = racesIsValidating || data == undefined ? 'loading' : 'idle'

    console.log(data)
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
                cell: props => <Action {...props} id={props.row.original.id} viewRace={viewRace} />
            })
        ],
        getCoreRowModel: getCoreRowModel()
    })
    return (
        <Table
            id={'racesTable'}
            aria-label={'table showing list of races'}
            bottomContent={
                pages > 0 ? (
                    <div className='flex w-full justify-center'>
                        <Pagination isCompact showControls showShadow color='primary' page={page} total={pages} onChange={(page: any) => setPage(page)} />
                    </div>
                ) : null
            }
        >
            <TableHeader>
                {table
                    .getHeaderGroups()
                    .flatMap(headerGroup => headerGroup.headers)
                    .map(header => {
                        return <TableColumn key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableColumn>
                    })}
            </TableHeader>
            <TableBody emptyContent={'No races Found.'} loadingContent={<Spinner />} loadingState={loadingState}>
                {table.getRowModel().rows.map(row => (
                    <TableRow key={row.id}>
                        {row.getVisibleCells().map(cell => (
                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default RacesTable
