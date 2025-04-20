import React, { ChangeEvent, useState } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, getFilteredRowModel } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Input, Tooltip, Spinner } from '@nextui-org/react'
import { EyeIcon } from '@/components/icons/eye-icon'
import { SearchIcon } from '@/components/icons/search-icon'
import * as Fetcher from '@/components/Fetchers'
import { useSession, signIn } from 'next-auth/react'

const columnHelper = createColumnHelper<TrackerDataType>()

const Text = ({ ...props }) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)

    return <div className=''>{value}</div>
}

function Filter({ column, table }: { column: any; table: any }) {
    const columnFilterValue = column.getFilterValue()

    return (
        <Input
            isClearable
            className='w-full'
            placeholder='Search by name...'
            startContent={<SearchIcon />}
            value={column.getFilterValue()}
            onClear={() => column.setFilterValue('')}
            onValueChange={value => column.setFilterValue(value)}
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
    const onTrackerStatusClick = () => {
        props.trackerStatus(props.row.original)
    }
    return (
        <div className='relative flex items-center gap-2'>
            <Tooltip content='Info'>
                <span className='text-lg text-default-400 cursor-pointer active:opacity-50'>
                    <EyeIcon onClick={onTrackerStatusClick} />
                </span>
            </Tooltip>
        </div>
    )
}

const TrackerTable = (props: any) => {
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            signIn()
        }
    })
    const { trackers, trackersIsError, trackersIsValidating } = Fetcher.Trackers()

    const data = trackers || []

    const trackerStatus = (tracker: TrackerDataType) => {
        props.trackerStatus(tracker)
    }

    const loadingState = trackersIsValidating || data?.length === 0 ? 'loading' : 'idle'

    const table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('name', {
                header: 'Tracker',
                cell: props => <Text {...props} />,
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
        <div key={props.data}>
            <Table isStriped aria-label='Tracker Table'>
                <TableHeader>
                    {table
                        .getHeaderGroups()
                        .flatMap(headerGroup => headerGroup.headers)
                        .map(header => {
                            return (
                                <TableColumn key={header.id}>
                                    <div className='flex justify-between flex-row'>
                                        <div className='py-3'>{flexRender(header.column.columnDef.header, header.getContext())}</div>
                                        {header.column.getCanFilter() ? (
                                            <div className='w-full'>
                                                <Filter column={header.column} table={table} />
                                            </div>
                                        ) : null}
                                    </div>
                                </TableColumn>
                            )
                        })}
                </TableHeader>
                <TableBody loadingContent={<Spinner />} loadingState={loadingState}>
                    {table.getRowModel().rows.map(row => (
                        <TableRow key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default TrackerTable
