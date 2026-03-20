import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, getFilteredRowModel } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import EditStandardBoatDialog from '../layout/dashboard/EditStandardBoatModal'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import { useState } from 'react'
import * as Types from '@sailviz/types'

const columnHelper = createColumnHelper<Types.StandardBoatType>()

const Text = ({ value }: { value: string }) => {
    return <div>{value}</div>
}

const StandardBoatTable = () => {
    const { data: boats } = useQuery(orpcClient.boat.standard.all.queryOptions({ input: { boatId: '' } }))

    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [modalData, setModalData] = useState<Types.StandardBoatType | undefined>(undefined)

    const data = boats || []

    const onRowClick = (row: any) => {
        setModalData(row.original)
        setModalIsOpen(true)
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
            })
        ],
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel()
    })

    return (
        <div className='w-full'>
            <EditStandardBoatDialog open={modalIsOpen} boat={modalData} onClose={() => setModalIsOpen(false)} />
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

export default StandardBoatTable
