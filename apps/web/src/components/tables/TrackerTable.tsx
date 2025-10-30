import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, getFilteredRowModel } from '@tanstack/react-table'
import { EyeIcon } from '@components/icons/eye-icon'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table'
import { Button } from '@components/ui/button'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { useLoaderData } from '@tanstack/react-router'

const columnHelper = createColumnHelper<TrackerDataType>()

const Text = ({ value }: { value: string }) => {
    return <div className=''>{value}</div>
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
    const session = useLoaderData({ from: `__root__` })

    const trackers = [] as TrackerDataType[]

    const data = trackers || []

    const trackerStatus = (tracker: TrackerDataType) => {
        props.trackerStatus(tracker)
    }

    const table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('name', {
                header: 'Tracker',
                cell: props => <Text value={props.getValue()} />,
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
