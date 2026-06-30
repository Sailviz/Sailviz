import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, getFilteredRowModel } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import EditFlagDialog from '../layout/dashboard/EditFlagModal'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import { useState } from 'react'
import * as Types from '@sailviz/types'

const columnHelper = createColumnHelper<Types.Flag>()

const Text = ({ value }: { value: string }) => {
    return <div>{value}</div>
}

const Preview = ({ value }: { value: string }) => {
    const url = useQuery(orpcClient.image.getURL.queryOptions({ input: { s3key: value }, enabled: value != '' })).data
    return <img src={url} alt='' width={100} height={100} className='border-2'></img>
}

const CustomFlagTable = () => {
    const { data: flags } = useQuery(orpcClient.flag.org.custom.queryOptions())

    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [modalData, setModalData] = useState<Types.Flag | undefined>(undefined)

    const data = flags || []

    const onRowClick = (row: any) => {
        setModalData(row.original)
        setModalIsOpen(true)
    }

    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('name', {
                header: 'Name',
                cell: props => <Text value={props.getValue()} />,
                enableColumnFilter: true
            }),
            columnHelper.accessor('s3key', {
                header: 'Preview',
                cell: props => <Preview value={props.getValue()} />,
                enableColumnFilter: false
            })
        ],
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel()
    })

    return (
        <div className='w-full'>
            <EditFlagDialog open={modalIsOpen} flag={modalData} onClose={() => setModalIsOpen(false)} />
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

export default CustomFlagTable
