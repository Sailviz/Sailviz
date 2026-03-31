import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, type SortingState, useReactTable } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { Button } from '../ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import type { RaceType } from '@sailviz/types'

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

const Action = ({ viewHref, raceId }: { viewHref: string; raceId: string }) => {
    return (
        <Link to={viewHref + raceId} className='text-default-900 cursor-pointer'>
            <Button color='success'>Open</Button>
        </Link>
    )
}

const columnHelper = createColumnHelper<RaceType>()

const UpcomingRacesTable = ({ orgId, viewHref }: { orgId: string; viewHref: string }) => {
    const { data: todaysRaces } = useQuery(orpcClient.race.today.queryOptions({ input: { orgId } }))

    const [sorting, setSorting] = useState<SortingState>([{ id: 'number', desc: false }])
    const [data, setData] = useState<RaceType[]>([])

    useEffect(() => {
        if (todaysRaces) {
            setData(todaysRaces)
        }
    }, [todaysRaces])

    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor(data => data.series!.name, {
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
                cell: props => <Action raceId={props.row.original.id} viewHref={viewHref} />
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
