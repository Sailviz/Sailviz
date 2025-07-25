'use client'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { EyeIcon } from '@/components/icons/eye-icon'
import { EditIcon } from '@/components/icons/edit-icon'
import { DeleteIcon } from '@/components/icons/delete-icon'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@/components/helpers/users'
import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import Link from 'next/link'
import { useSession } from '@/lib/auth-client'
import * as Fetcher from '@/components/Fetchers'
import { mutate } from 'swr'

const Action = ({ ...props }: any) => {
    const onDeleteClick = () => {
        if (confirm('are you sure you want to do this?')) {
            props.deleteSeries(props.row.original.id)
        }
    }
    const onEditClick = () => {
        props.editSeries(props.row.original.id)
    }
    return (
        <div className='relative flex items-center gap-2'>
            <Link href={`${props.viewHref}${props.row.original.id}`} className='cursor-pointer'>
                <EyeIcon onClick={() => props.viewSeries(props.row.original.id)} />
            </Link>

            {userHasPermission(props.user, AVAILABLE_PERMISSIONS.editSeries) ? (
                <>
                    <EditIcon onClick={onEditClick} className='cursor-pointer' />
                    <DeleteIcon onClick={onDeleteClick} className='cursor-pointer' />
                </>
            ) : (
                <></>
            )}
        </div>
    )
}

const columnHelper = createColumnHelper<SeriesDataType>()

const ClubTable = ({ viewHref }: { viewHref: string }) => {
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()
    const { series, seriesIsError, seriesIsValidating } = Fetcher.GetSeriesByClubId(session?.club!)
    // const [data, setData] = useState<SeriesDataType[]>([])

    const Router = useRouter()

    const deleteSeries = async (seriesId: string) => {
        await DB.deleteSeriesById(seriesId)
        mutate('/api/GetSeriesByClubId') // This will revalidate the series data
    }

    const editSeries = async (series: SeriesDataType) => {
        await DB.updateSeries(series)
    }

    const data = series || []

    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('name', {
                header: 'Series Name',
                cell: info => info.getValue()
            }),
            columnHelper.accessor(row => row.races.length.toString(), {
                id: 'Number of Races',
                cell: info => info.getValue()
            }),
            columnHelper.accessor(row => row.settings['numberToCount'], {
                id: 'Races to Count',
                cell: info => info.getValue()
            }),
            columnHelper.accessor('id', {
                id: 'Remove',
                header: 'Actions',
                cell: props => <Action {...props} id={props.row.original.id} deleteSeries={deleteSeries} viewHref={viewHref} editSeries={editSeries} user={session!.user} />
            })
        ],
        getCoreRowModel: getCoreRowModel()
    })
    return (
        <div>
            <Table id={'clubTable'} aria-label='table of series'>
                <TableHeader>
                    {table
                        .getHeaderGroups()
                        .flatMap(headerGroup => headerGroup.headers)
                        .map(header => {
                            return <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                        })}
                </TableHeader>
                <TableBody>
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

export default ClubTable
