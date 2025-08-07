'use client'
import React, { useEffect, useState } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, SortingState } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import * as Fetcher from '@/components/Fetchers'
import Link from 'next/link'

const Text = ({ value }: { value: string }) => {
    return <div className=' text-center'>{value}</div>
}

const Time = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(new Date((initialValue - props.startTime) * 1000).toISOString().substring(11, 19))
    if (initialValue == -1) {
        return <p className='p-2 m-2 text-center w-full'>Retired</p>
    } else if (initialValue == 0) {
        return <p className='p-2 m-2 text-center w-full'>-</p>
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

const Edit = ({ resultId }: { resultId: string }) => {
    return (
        <Link href={`/editResult/${resultId}`} scroll={false}>
            <Button>Edit</Button>
        </Link>
    )
}

const View = ({ resultId }: { resultId: string }) => {
    return (
        <Link href={`/viewResult/${resultId}`} scroll={false}>
            <Button>View</Button>
        </Link>
    )
}

const columnHelper = createColumnHelper<ResultDataType>()

const FleetHandicapResultsTable = ({ fleetId, editable, showTime }: { fleetId: string; editable: boolean; showTime: boolean }) => {
    const { fleet, fleetIsValidating, fleetIsError } = Fetcher.Fleet(fleetId)
    let data = fleet?.results
    if (data == undefined) {
        data = []
    }
    let [startTime, setStartTime] = useState(fleet?.startTime || 0)

    const [sorting, setSorting] = useState<SortingState>([
        {
            id: 'HandicapPosition',
            desc: false
        }
    ])

    useEffect(() => {
        setStartTime(fleet?.startTime || 0)
    }, [fleet?.startTime])

    let columns = [
        columnHelper.accessor('HandicapPosition', {
            header: 'Position',
            cell: props => <Text value={props.getValue().toString()} />,
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
            cell: props => <Text value={props.getValue()?.name || ''} />,
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
        cell: props => <Edit resultId={props.row.original.id} />
    })

    const viewColumn = columnHelper.display({
        id: 'Edit',
        cell: props => <View resultId={props.row.original.id} />
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
                    {fleet?.fleetSettings?.name}: {data.length} boats entered
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
