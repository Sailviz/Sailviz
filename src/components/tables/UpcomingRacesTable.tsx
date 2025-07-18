'use client'
import React, { ChangeEvent, useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, RowSelection, SortingState, useReactTable } from '@tanstack/react-table'
import * as DB from '@/components/apiMethods'
import Select, { CSSObjectWithLabel } from 'react-select'
import { VerticalDotsIcon } from '@/components/icons/vertical-dots-icon'
import { EyeIcon } from '@/components/icons/eye-icon'
import { EditIcon } from '@/components/icons/edit-icon'
import { DeleteIcon } from '@/components/icons/delete-icon'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import * as Fetcher from '@/components/Fetchers'
import { PageSkeleton } from '@/components/layout/PageSkeleton'
import { Button } from '../ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { useSession } from '@/lib/auth-client'

const Time = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)

    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])
    return (
        <>
            <div>{'Today at ' + dayjs(value).format(' h:mm A')}</div>
        </>
    )
}

const Action = ({ ...props }: any) => {
    const Router = useRouter()

    return (
        <>
            <Button color='success' onClick={() => Router.push('/Race/' + props.row.original.id)}>
                Open
            </Button>
        </>
    )
}

const columnHelper = createColumnHelper<NextRaceDataType>()

const UpcomingRacesTable = () => {
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()
    const { todaysRaces, todaysRacesIsError, todaysRacesIsValidating, mutateTodaysRaces } = Fetcher.GetTodaysRaceByClubId(session?.club?.id)
    const [sorting, setSorting] = useState<SortingState>([{ id: 'number', desc: false }])
    const [data, setData] = useState<NextRaceDataType[]>([])

    useEffect(() => {
        if (todaysRaces) {
            setData(todaysRaces)
        }
    }, [todaysRaces])

    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor(data => data.series.name, {
                header: 'Series',
                cell: info => info.getValue().toString(),
                enableSorting: true
            }),
            columnHelper.accessor('number', {
                header: 'Number',
                cell: info => info.getValue().toString(),
                enableSorting: true
            }),
            columnHelper.accessor('Time', {
                cell: props => <Time {...props} />
            }),
            columnHelper.accessor('id', {
                id: 'action',
                header: 'Actions',
                cell: props => <Action {...props} id={props.row.original.id} />
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
        <div>
            <Table id={'seriesTable'} aria-label='Upcoming Races Table'>
                <TableHeader>
                    <TableRow>
                        {table
                            .getHeaderGroups()
                            .flatMap(headerGroup => headerGroup.headers)
                            .map(header => {
                                return <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                            })}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows.map(row => (
                        <TableRow key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default UpcomingRacesTable
