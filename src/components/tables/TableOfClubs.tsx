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

const columnHelper = createColumnHelper<ClubDataType>()

const TableOfClubs = () => {
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()
    const { clubs, clubsIsError, clubsIsValidating } = Fetcher.Clubs()
    // const [data, setData] = useState<SeriesDataType[]>([])

    const Router = useRouter()

    const data = clubs || []

    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('name', {
                header: 'Club Name',
                cell: info => info.getValue()
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

export default TableOfClubs
