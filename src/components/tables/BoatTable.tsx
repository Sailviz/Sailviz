'use client'
import React, { useState } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, getFilteredRowModel } from '@tanstack/react-table'
import { EditIcon } from '@/components/icons/edit-icon'
import { DeleteIcon } from '@/components/icons/delete-icon'
import * as Fetcher from '@/components/Fetchers'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@/components/helpers/users'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Input } from '../ui/input'
import Link from 'next/link'
import { useSession } from '@/lib/auth-client'
import * as DB from '@/components/apiMethods'
import { Button } from '../ui/button'
import EditBoatDialog from '../layout/dashboard/EditBoatModal'
import { useRouter } from 'next/navigation'

const columnHelper = createColumnHelper<BoatDataType>()

const Text = ({ value }: { value: string }) => {
    return <div>{value}</div>
}

const StartTime = ({ value }: { value: number }) => {
    //change to minutes:seconds
    const time = new Date(Math.abs(value) * 1000).toISOString().substr(14, 5)
    if (value >= 0) {
        return <div>+{time}</div>
    } else {
        return <div>-{time}</div>
    }
}

const BoatTable = () => {
    const Router = useRouter()
    const { boats, boatsIsError, boatsIsValidating, mutateBoats } = Fetcher.Boats()

    const data = boats || []

    const onRowClick = (row: any) => {
        console.log(row)
        Router.push(`/editBoat/${row.original.id}`, { scroll: false })
    }

    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('name', {
                header: 'Boat',
                cell: props => <Text value={props.getValue()} />,
                enableColumnFilter: true
            }),
            columnHelper.accessor('crew', {
                header: 'Crew',
                cell: props => <Text value={props.getValue()} />,
                enableColumnFilter: false
            }),
            columnHelper.accessor('py', {
                id: 'py',
                header: 'PY',
                cell: props => <Text value={props.getValue().toString()} />,
                enableColumnFilter: false
            }),
            columnHelper.accessor('pursuitStartTime', {
                id: 'pursuitStartTime',
                header: () => <span>Pursuit Start Time</span>,
                cell: props => <StartTime value={props.getValue()} />,
                enableColumnFilter: false
            })
        ],
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel()
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
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} onClick={() => onRowClick(row)} className='cursor-pointer'>
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
                <div className='flex-1 text-sm text-muted-foreground'>{table.getFilteredRowModel().rows.length} Boats.</div>
            </div>
        </div>
    )
}

export default BoatTable
