import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { createColumnHelper, flexRender, getCoreRowModel, type PaginationState, useReactTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table'
import { Button } from '@components/ui/button'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'

const Time = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)

    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])
    return (
        <>
            <div>{dayjs(value).format('D MMMM h:mm A')}</div>
        </>
    )
}

const Race = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)
    console.log(initialValue)
    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])
    return (
        <>
            <div>{value.name}</div>
        </>
    )
}

const Action = ({ viewHref, raceId }: { viewHref: string; raceId: string }) => {
    return (
        <Link to={viewHref + raceId} className='text-default-900 cursor-pointer'>
            <Button variant='outline' className='w-16 h-8 p-0'>
                View
            </Button>
        </Link>
    )
}

const columnHelper = createColumnHelper<RaceDataType>()

const RacesTable = ({ date, historical, viewHref, clubId }: { date: Date; historical: boolean; viewHref: string; clubId: string }) => {
    const [page, setPage] = useState(1)
    // const {
    //     data: races,
    //     error: racesIsError,
    //     isValidating: racesIsValidating
    // } = useSWR(`/api/GetRacesByClubId?id=${clubId || ''}&page=${page}&date=${date}&historical=${historical}`, Fetcher.fetcher)
    const { data: races } = useQuery(orpcClient.race.club.queryOptions({ input: { clubId: clubId!, date: date.toISOString(), historical: historical, page: page } }))
    const [data, setData] = useState<RaceDataType[]>([])
    const [count, setCount] = useState(0)
    const rowsPerPage = 10

    const [pages, setPages] = useState(0)

    useEffect(() => {
        setPages(count ? Math.ceil(count / rowsPerPage) : 0)
    }, [count, rowsPerPage])

    const onPaginationChange = (updaterOrValue: PaginationState | ((old: PaginationState) => PaginationState)) => {
        setPage(oldPage => {
            let newPageIndex: number
            if (typeof updaterOrValue === 'function') {
                const newState = updaterOrValue({ pageIndex: oldPage - 1, pageSize: rowsPerPage })
                newPageIndex = newState.pageIndex + 1
            } else {
                newPageIndex = updaterOrValue.pageIndex + 1
            }
            if (newPageIndex < 1) return 1
            if (newPageIndex > pages) return pages
            return newPageIndex
        })
    }

    useEffect(() => {
        if (races) {
            setData(races.races)
            setCount(races.count)
        }
    }, [races])

    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor(data => data.series, {
                id: 'Series',
                cell: props => <Race {...props} />
            }),
            columnHelper.accessor('number', {
                header: 'Number',
                cell: info => info.getValue().toString(),
                enableSorting: true
            }),
            columnHelper.accessor('Time', {
                header: 'Date/Time',
                cell: props => <Time {...props} />
            }),
            columnHelper.accessor('id', {
                id: 'action',
                header: '',
                cell: props => <Action raceId={props.row.original.id} viewHref={viewHref} />
            })
        ],
        manualPagination: true,
        pageCount: pages,
        onPaginationChange: onPaginationChange,
        getCoreRowModel: getCoreRowModel()
    })

    return (
        <div className='w-full'>
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
            <div className='flex items-center justify-end space-x-2 py-4'>
                <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
                    Page {page} of {pages}
                </div>
                <div className='space-x-2'>
                    <Button variant='outline' size='sm' onClick={() => table.previousPage()} disabled={page <= 1}>
                        Previous
                    </Button>
                    <Button variant='outline' size='sm' onClick={() => table.nextPage()} disabled={page >= pages}>
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default RacesTable
