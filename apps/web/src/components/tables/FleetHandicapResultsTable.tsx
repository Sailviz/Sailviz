import React, { useEffect, useState } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type SortingState } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table'
import { Button } from '@components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import type { ResultType } from '@sailviz/types'
import EditResultDialog from '@components/layout/dashboard/EditResultModal'
import ViewResultDialog from '@components/layout/dashboard/viewResultModal'

const Text = ({ value }: { value: string }) => {
    return <div className=' text-center'>{value}</div>
}

const Time = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value] = React.useState(new Date((initialValue - props.startTime) * 1000).toISOString().substring(11, 19))
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

const columnHelper = createColumnHelper<ResultType>()

const FleetHandicapResultsTable = ({ fleetId, editable, advancedEdit, showTime }: { fleetId: string; editable: boolean; advancedEdit: boolean; showTime: boolean }) => {
    const { data: fleet } = useQuery(orpcClient.fleet.find.queryOptions({ input: { fleetId } }))

    const [editModalOpen, setEditModalOpen] = useState(false)
    const [viewModalOpen, setViewModalOpen] = useState(false)
    const [modalData, setModalData] = useState<ResultType | undefined>(undefined)

    let [startTime, setStartTime] = useState(fleet?.startTime || 0)

    const [sorting, setSorting] = useState<SortingState>([
        {
            id: 'HandicapPosition',
            desc: false
        }
    ])

    useEffect(() => {
        console.log('Fleet updated:', fleet)
    }, [fleet])

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
        cell: props => <CorrectedTime {...props} result={fleet?.results?.find(result => result.id == props.row.original.id)} />,
        enableSorting: false
    })

    if (showTime) {
        columns.splice(5, 0, timeColumn)
        columns.splice(6, 0, correctedTimeColumn)
    }

    const editColumn = columnHelper.accessor('id', {
        id: 'Edit',
        cell: props => (
            <Button
                onClick={() => {
                    setEditModalOpen(true)
                    setModalData(props.row.original)
                }}
            >
                Edit
            </Button>
        )
    })

    const viewColumn = columnHelper.accessor('id', {
        id: 'View',
        cell: props => (
            <Button
                onClick={() => {
                    setViewModalOpen(true)
                    setModalData(props.row.original)
                }}
            >
                View
            </Button>
        )
    })

    if (editable) {
        columns.push(editColumn)
    } else {
        columns.push(viewColumn)
    }

    let table = useReactTable({
        data: fleet?.results || [],
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
            <EditResultDialog open={editModalOpen} result={modalData} advancedEdit={advancedEdit} onClose={() => setEditModalOpen(false)} />
            <ViewResultDialog open={viewModalOpen} result={modalData} onClose={() => setViewModalOpen(false)} />

            <div className='flex items-center py-4'>
                <h1>
                    {fleet?.fleetSettings?.name}: {fleet?.results?.length} boats entered
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
