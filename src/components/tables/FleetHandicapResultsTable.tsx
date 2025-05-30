'use client'
import React, { useState, useEffect } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, SortingState } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu'
import * as Fetcher from '@/components/Fetchers'
import useSWR from 'swr'
import { EyeIcon } from '../icons/eye-icon'
import { ChevronDown } from 'lucide-react'
import { redirect, useRouter } from 'next/navigation'

const Text = ({ ...props }) => {
    const value = props.getValue()

    return <div className=' text-center'>{value}</div>
}

const Laps = ({ ...props }: any) => {
    const value = props.getValue()
    // value is the array of laps

    return <div className=' text-center'>{value}</div>
}

const Time = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(new Date((initialValue - props.startTime) * 1000).toISOString().substring(11, 19))
    if (initialValue == -1) {
        return <p className='p-2 m-2 text-center w-full'>Retired</p>
    } else {
        return <p> {value}</p>
    }
}

const CorrectedTime = ({ ...props }) => {
    let value = Math.round(props.getValue())
    let result = props.result
    let valueString = ''
    if (result.resultCode != '') {
        valueString = result.resultCode
    } else {
        valueString = value.toString()
    }
    //round value to nearest integer

    return <div className=' text-center'>{valueString}</div>
}

const Class = ({ ...props }: any) => {
    let value = props.getValue()
    try {
        value = value.name
    } catch (error) {
        value = ''
    }

    return <div className=' text-center'>{value}</div>
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

const View = ({ ...props }: any) => {
    const onClick = () => {
        //show edit modal
        props.showViewModal(props.row.original.id)
    }
    return (
        <>
            <EyeIcon onClick={onClick} />
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

const columnHelper = createColumnHelper<ResultDataType>()

const FleetHandicapResultsTable = (props: any) => {
    const Router = useRouter()
    const { fleet, fleetIsValidating, fleetIsError } = Fetcher.Fleet(props.fleetId)
    let data = fleet?.results
    if (data == undefined) {
        data = []
    }
    let [editable, setEditable] = useState(props.editable)
    let [showTime, setShowTime] = useState(props.showTime)
    let [startTime, setStartTime] = useState(fleet?.startTime || 0)

    const showEditModal = (id: any) => {
        Router.push(`/editResult/${id}`)
    }

    const showViewModal = (id: any) => {
        props.showViewModal(id)
    }

    const [sorting, setSorting] = useState<SortingState>([
        {
            id: 'HandicapPosition',
            desc: false
        }
    ])

    let columns = [
        columnHelper.accessor('HandicapPosition', {
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

    const timeColumn = columnHelper.accessor('finishTime', {
        header: 'Time',
        cell: props => <Time {...props} startTime={startTime} />,
        enableSorting: false
    })

    const correctedTimeColumn = columnHelper.accessor('CorrectedTime', {
        header: 'Corrected Time',
        cell: props => <CorrectedTime {...props} result={data?.find(result => result.id == props.row.original.id)} />,
        enableSorting: false
    })

    if (showTime) {
        columns.splice(5, 0, timeColumn)
        columns.splice(6, 0, correctedTimeColumn)
    }

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

    const viewColumn = columnHelper.display({
        id: 'Edit',
        cell: props => (
            <View
                {...props}
                showViewModal={(id: string) => {
                    showViewModal(id)
                }}
            />
        )
    })

    if (editable) {
        columns.push(editColumn)
    } else {
        columns.push(viewColumn)
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
                <h1>
                    {fleet.fleetSettings.name}: {data.length} boats entered
                </h1>
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

export default FleetHandicapResultsTable
