import React, { ChangeEvent, useState } from 'react'
import dayjs from 'dayjs'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, RowSelection, SortingState, useReactTable } from '@tanstack/react-table'

import { EditIcon } from '@/components/icons/edit-icon'
import { DeleteIcon } from '@/components/icons/delete-icon'
import * as Fetcher from '@/components/Fetchers'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@/components/helpers/users'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from '@/lib/auth-client'

const Action = ({ ...props }: any) => {
    console.log(props.row.original)
    const onDeleteClick = () => {
        if (confirm('are you sure you want to do this?')) {
            props.deleteRole(props.row.original)
        }
    }
    if (userHasPermission(props.user, AVAILABLE_PERMISSIONS.editRoles)) {
        return (
            <div className='relative flex items-center gap-2'>
                <Link className='cursor-pointer' href={`/editRole/${props.row.original.id}`}>
                    <EditIcon />
                </Link>
                <DeleteIcon onClick={onDeleteClick} />
            </div>
        )
    } else {
        return <> </>
    }
}

const columnHelper = createColumnHelper<RoleDataType>()

const UsersTable = (props: any) => {
    const Router = useRouter()
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { roles, rolesIsError, rolesIsValidating } = Fetcher.Roles(club)

    const [sorting, setSorting] = useState<SortingState>([
        {
            id: 'number',
            desc: false
        }
    ])

    const deleteRole = (data: any) => {
        props.deleteRole(data)
    }

    var data = roles
    if (data == undefined) {
        data = []
    }

    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('name', {
                id: 'number',
                cell: info => info.getValue(),
                enableSorting: true
            }),
            columnHelper.accessor('id', {
                id: 'edit',
                header: 'Action',
                cell: props => <Action {...props} id={props.row.original.id} deleteRole={deleteRole} user={session!.user} />
            })
        ],
        state: {
            sorting
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel()
    })
    return (
        <div className='rounded-md border w-full'>
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map(headerGroup => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map(header => {
                                return <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
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
                            <TableCell className='h-24 text-center'>No Roles.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

export default UsersTable
