'use client'
import React, { useState, useEffect } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, SortingState } from '@tanstack/react-table'
import { VerticalDotsIcon } from '@/components/icons/vertical-dots-icon'
import * as Fetcher from '@/components/Fetchers'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'

const Text = ({ ...props }) => {
    const value = props.getValue()

    return <div>{value}</div>
}

const Laps = ({ ...props }: any) => {
    const value = props.getValue()
    // value is the array of laps

    return <div>{value}</div>
}

const Class = ({ ...props }: any) => {
    let value = props.getValue()
    try {
        value = value.name
    } catch (error) {
        value = ''
    }

    return <div>{value}</div>
}

const Edit = ({ ...props }: any) => {
    const onClick = () => {
        //show edit modal
        props.showEditModal(props.row.original.id)
    }
    return (
        <>
            <p
                className='cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0'
                onClick={onClick}
            >
                Edit
            </p>
        </>
    )
}

function Sort({ column, table }: { column: any; table: any }) {
    const firstValue = table.getPreFilteredRowModel().flatRows[0]?.getValue(column.id)

    const columnFilterValue = column.getFilterValue()

    return (
        <div className='flex flex-row justify-center'>
            <p onClick={e => column.toggleSorting(true)} className='cursor-pointer'>
                ▲
            </p>
            <p onClick={e => column.toggleSorting(false)} className='cursor-pointer'>
                ▼
            </p>
        </div>
    )
}

const columnHelper = createColumnHelper<ResultsDataType>()

const FleetPursuitResultsTable = (props: any) => {
    const { fleet, fleetIsValidating, fleetIsError } = Fetcher.Fleet(props.fleetId)
    let data = fleet?.results
    if (data == undefined) {
        data = []
    }
    let [editable, setEditable] = useState(props.editable)

    const showEditModal = (id: any) => {
        props.showEditModal(id)
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
            cell: props => <Text {...props} disabled={true} />,
            enableSorting: true
        }),
        columnHelper.accessor('Helm', {
            header: 'Helm',
            cell: props => <Text {...props} />,
            enableSorting: false
        }),
        columnHelper.accessor('Crew', {
            header: 'Crew',
            cell: props => <Text {...props} />,
            enableSorting: false
        }),
        columnHelper.accessor('boat', {
            header: 'Class',
            id: 'Class',
            size: 300,
            cell: props => <Class {...props} />,
            enableSorting: false
        }),
        columnHelper.accessor('SailNumber', {
            header: 'Sail Number',
            cell: props => <Text {...props} />,
            enableSorting: false
        }),
        columnHelper.accessor('numberLaps', {
            header: 'Laps',
            cell: props => <Laps {...props} />,
            enableSorting: false
        })
    ]

    const editColumn = columnHelper.display({
        id: 'Edit',
        cell: props => (
            <Edit
                {...props}
                showEditModal={(id: string) => {
                    showEditModal(id)
                }}
            />
        )
    })

    if (editable) {
        columns.push(editColumn)
    }

    const loadingState = fleetIsValidating ? 'loading' : 'idle'

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

export default FleetPursuitResultsTable
