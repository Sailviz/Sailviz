import { useState } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type SortingState } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table'
import { Button } from '@components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import type { BoatType, ResultType } from '@sailviz/types'
import EditResultModal from '@components/layout/dashboard/EditResultModal'
import ViewResultDialog from '@components/layout/dashboard/viewResultModal'

const Text = ({ value }: { value: string }) => {
    return <div>{value}</div>
}
const Class = ({ value }: { value: BoatType }) => {
    return <div>{value.name}</div>
}

const columnHelper = createColumnHelper<ResultType>()

const FleetPursuitResultsTable = ({ fleetId, editable, advancedEdit }: { fleetId: string; editable: boolean; advancedEdit: boolean }) => {
    const { data: fleet } = useQuery(orpcClient.fleet.find.queryOptions({ input: { fleetId } }))

    const [editModalOpen, setEditModalOpen] = useState(false)
    const [viewModalOpen, setViewModalOpen] = useState(false)
    const [modalData, setModalData] = useState<ResultType | undefined>(undefined)

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
            <EditResultModal open={editModalOpen} result={modalData} advancedEdit={advancedEdit} onClose={() => setEditModalOpen(false)} />
            <ViewResultDialog open={viewModalOpen} result={modalData} onClose={() => setViewModalOpen(false)} />
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
