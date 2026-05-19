import { useState } from 'react'
import dayjs from 'dayjs'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, type SortingState, useReactTable } from '@tanstack/react-table'
import { useNavigate } from '@tanstack/react-router'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table'
import { Button } from '@components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import type { RaceType, SeriesType } from '@sailviz/types'

const Text = ({ ...props }) => {
    const value = props.getValue()

    return <div>{value}</div>
}

const Time = ({ initialValue }: { initialValue: any }) => {
    return <div>{initialValue ? dayjs(initialValue).format('D MMM YYYY, HH:mm') : '-'}</div>
}

const Action = ({ id }: { id: string }) => {
    const navigate = useNavigate()

    return (
        <div className='relative flex items-center gap-2'>
            <Button onClick={() => navigate({ to: '../../Race/' + id })}>View</Button>
        </div>
    )
}

const columnHelper = createColumnHelper<RaceType>()

const SeriesRaceTableMinimal = ({ seriesId }: { seriesId: string }) => {
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
                cell: props => <Time initialValue={props.getValue()} />
            }),
            columnHelper.accessor('Type', {
                id: 'Type',
                cell: props => <Text {...props} />
            }),
            columnHelper.accessor('id', {
                id: 'action',
                header: 'Actions',
                cell: props => <Action id={props.row.original.id} />
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

export default SeriesRaceTableMinimal
