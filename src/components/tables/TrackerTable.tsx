'use client'
import React, { ChangeEvent, useState } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, getFilteredRowModel } from '@tanstack/react-table'
import { EyeIcon } from '@/components/icons/eye-icon'
import { SearchIcon } from '@/components/icons/search-icon'
import * as Fetcher from '@/components/Fetchers'
import { useSession, signIn } from 'next-auth/react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'

const columnHelper = createColumnHelper<TrackerDataType>()

const Text = ({ ...props }) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)

    return <div className=''>{value}</div>
}

function Filter({ column, table }: { column: any; table: any }) {
    const columnFilterValue = column.getFilterValue()

    return (
        <Input
            className='w-full'
            placeholder='Search by name...'
            value={column.getFilterValue()}
            //so that you can type a space, otherwise it will be blocked
            onKeyDown={(e: any) => {
                if (e.key === ' ') {
                    e.stopPropagation()
                }
            }}
        />
    )
}

const Action = ({ ...props }: any) => {
    const onTrackerStatusClick = () => {
        props.trackerStatus(props.row.original)
    }
    return (
        <div className='relative flex items-center gap-2'>
            <EyeIcon onClick={onTrackerStatusClick} />
        </div>
    )
}

const TrackerTable = (props: any) => {
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            signIn()
        }
    })
    const { trackers, trackersIsError, trackersIsValidating } = Fetcher.Trackers()

    const data = trackers || []

    const trackerStatus = (tracker: TrackerDataType) => {
        props.trackerStatus(tracker)
    }

    const loadingState = trackersIsValidating || data?.length === 0 ? 'loading' : 'idle'

    const table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('name', {
                header: 'Tracker',
                cell: props => <Text {...props} />,
                enableColumnFilter: true
            }),
            columnHelper.accessor('trackerID', {
                id: 'action',
                enableColumnFilter: false,
                header: 'Actions',
                cell: props => <Action {...props} id={props.row.original.trackerID} trackerStatus={trackerStatus} user={session!.user} />
            })
        ],
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel()
    })

    return (
        <div className='w-full'>
            <div className='flex items-center py-4'>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant='outline' className='ml-auto'>
                            Columns <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                        {table
                            .getAllColumns()
                            .filter(column => column.getCanHide())
                            .map(column => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className='capitalize'
                                        checked={column.getIsVisible()}
                                        onCheckedChange={value => column.toggleVisibility(!!value)}
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
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

export default TrackerTable
