'use client'
import React, { useState, useEffect } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, SortingState } from '@tanstack/react-table'
import * as Fetcher from '@/components/Fetchers'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import Link from 'next/link'

const Text = ({ value }: { value: string }) => {
    return <div>{value}</div>
}
const Class = ({ value }: { value: BoatDataType }) => {
    return <div>{value.name}</div>
}

const Edit = ({ result }: { result: ResultDataType }) => {
    return (
        <Link href={`/editResult/${result.id}`} scroll={false}>
            <Button className='mx-1'>Edit</Button>
        </Link>
    )
}

const columnHelper = createColumnHelper<ResultDataType>()

const FleetPursuitResultsTable = ({ fleetId, editable }: { fleetId: string; editable: boolean }) => {
    const { fleet, fleetIsValidating, fleetIsError } = Fetcher.Fleet(fleetId)
    let data = fleet?.results
    if (data == undefined) {
        data = []
    }

    const [sorting, setSorting] = useState<SortingState>([
        {
            id: 'PursuitPosition',
            desc: false
        }
    ])

    let columns = [
        columnHelper.accessor('PursuitPosition', {
            header: 'Position',
            // If the resultCode is empty, display position, otherwise display resultCode
            cell: props => <Text value={props.row.original.resultCode == '' ? props.getValue().toString() : props.row.original.resultCode} />,
            enableSorting: true
        }),
        columnHelper.accessor('Helm', {
            header: 'Helm',
            cell: props => <Text value={props.getValue()} />,
            enableSorting: false
        }),
        columnHelper.accessor('Crew', {
            header: 'Crew',
            cell: props => <Text value={props.getValue()} />,
            enableSorting: false
        }),
        columnHelper.accessor('boat', {
            header: 'Class',
            id: 'Class',
            size: 300,
            cell: props => <Class value={props.getValue()} />,
            enableSorting: false
        }),
        columnHelper.accessor('SailNumber', {
            header: 'Sail Number',
            cell: props => <Text value={props.getValue()} />,
            enableSorting: false
        }),
        columnHelper.accessor('numberLaps', {
            header: 'Laps',
            cell: props => <Text value={props.getValue().toString()} />,
            enableSorting: false
        })
    ]

    const editColumn = columnHelper.display({
        id: 'Edit',
        cell: props => <Edit result={props.row.original} />
    })

    if (editable) {
        columns.push(editColumn)
    }

    let table = useReactTable({
        data,
        columns: columns,
        state: {
            sorting
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel()
    })
    return (
        <div className='w-full'>
            <div className='flex items-center py-4'>
                <h1>{data.length} boats entered</h1>
            </div>
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

export default FleetPursuitResultsTable
