'use client'
import React, { ChangeEvent, useState } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, getFilteredRowModel } from '@tanstack/react-table'
import { EditIcon } from '@/components/icons/edit-icon'
import { DeleteIcon } from '@/components/icons/delete-icon'
import { SearchIcon } from '@/components/icons/search-icon'
import * as Fetcher from '@/components/Fetchers'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@/components/helpers/users'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useSession } from '@/lib/auth-client'

const columnHelper = createColumnHelper<BoatDataType>()

const Number = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)

    return <div className=''>{value}</div>
}

const Text = ({ ...props }) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)

    return <div className=''>{value}</div>
}

const StartTime = ({ ...props }: any) => {
    const initialValue: number = props.getValue()
    //change to minutes:seconds
    const time = new Date(Math.abs(initialValue) * 1000).toISOString().substr(14, 5)
    const [value, setValue] = React.useState(time)
    if (initialValue >= 0) {
        return <div className=''>+{value}</div>
    } else {
        return <div className=''>-{value}</div>
    }
}

function Filter({ column, table }: { column: any; table: any }) {
    const columnFilterValue = column.getFilterValue()

    return (
        <Input
            className='w-full'
            placeholder='Search by name...'
            // startContent={<SearchIcon />}
            value={column.getFilterValue()}
            // onClear={() => column.setFilterValue('')}
            // onValueChange={value => column.setFilterValue(value)}
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
    const onDeleteClick = () => {
        if (confirm('are you sure you want to do this?')) {
            props.deleteBoat(props.row.original)
        }
    }

    if (userHasPermission(props.user, AVAILABLE_PERMISSIONS.editBoats)) {
        return (
            <div className='relative flex items-center gap-2'>
                <Link href={`/editBoat/${props.row.original.id}`} className='cursor-pointer'>
                    <EditIcon />
                </Link>

                <DeleteIcon onClick={onDeleteClick} />
            </div>
        )
    } else {
        return <> </>
    }
}

const BoatTable = (props: any) => {
    const { boats, boatsIsError, boatsIsValidating } = Fetcher.Boats()
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()

    const data = boats || []

    const deleteBoat = (id: any) => {
        props.deleteBoat(id)
    }

    const loadingState = boatsIsValidating || data?.length === 0 ? 'loading' : 'idle'

    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('name', {
                header: 'Boat',
                cell: props => <Text {...props} />,
                enableColumnFilter: true
            }),
            columnHelper.accessor('crew', {
                header: 'Crew',
                cell: props => <Number {...props} />,
                enableColumnFilter: false
            }),
            columnHelper.accessor('py', {
                id: 'py',
                header: 'PY',
                cell: props => <Number {...props} />,
                enableColumnFilter: false
            }),
            columnHelper.accessor('pursuitStartTime', {
                id: 'pursuitStartTime',
                header: () => <span>Pursuit Start Time</span>,
                cell: props => <StartTime {...props} />,
                enableColumnFilter: false
            }),
            columnHelper.accessor('id', {
                id: 'action',
                enableColumnFilter: false,
                header: 'Actions',
                cell: props => <Action {...props} id={props.row.original.id} deleteBoat={deleteBoat} user={session!.user} />
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
                <div className='flex-1 text-sm text-muted-foreground'>{table.getFilteredRowModel().rows.length} Boats.</div>
            </div>
        </div>
    )
}

export default BoatTable
