import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, getFilteredRowModel } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import { useState } from 'react'
import * as Types from '@sailviz/types'
import EditBuoyDialog from '@components/layout/dashboard/EditBuoyModal'

const columnHelper = createColumnHelper<Types.BuoyType>()

const Text = ({ value }: { value: string }) => {
    return <div>{value}</div>
}

const BuoyTable = () => {
    const { data: buoys } = useQuery(orpcClient.buoy.session.queryOptions())

    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [modalData, setModalData] = useState<Types.BuoyType | undefined>(undefined)

    const data = buoys?.sort((a, b) => (a.name < b.name ? -1 : 1)) || []

    const onRowClick = (row: any) => {
        setModalData(row.original)
        setModalIsOpen(true)
    }

    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('name', {
                header: 'Buoy',
                cell: props => <Text value={props.getValue()} />,
                enableColumnFilter: true
            }),
            columnHelper.accessor('isMoveable', {
                header: 'Moveable',
                cell: props => <Text value={props.getValue() ? 'yes' : 'no'} />,
                enableColumnFilter: false
            }),
            columnHelper.accessor('isStartLine', {
                header: 'Start Line',
                cell: props => <Text value={props.getValue() ? 'yes' : 'no'} />,
                enableColumnFilter: false
            }),
            columnHelper.accessor('lat', {
                id: 'lat',
                header: 'Lat',
                cell: props => <Text value={props.getValue().toString()} />,
                enableColumnFilter: false
            }),
            columnHelper.accessor('lon', {
                id: 'lon',
                header: 'Lat',
                cell: props => <Text value={props.getValue().toString()} />,
                enableColumnFilter: false
            })
        ],
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel()
    })

    return (
        <div className='w-full'>
            <EditBuoyDialog open={modalIsOpen} buoy={modalData} onClose={() => setModalIsOpen(false)} />
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
                <div className='flex-1 text-sm text-muted-foreground'>{table.getFilteredRowModel().rows.length} Buoys.</div>
            </div>
        </div>
    )
}

export default BuoyTable
