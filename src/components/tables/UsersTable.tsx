import React, { ChangeEvent, useState } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, RowSelection, SortingState, useReactTable } from '@tanstack/react-table'
import { EditIcon } from '@/components/icons/edit-icon'
import { DeleteIcon } from '@/components/icons/delete-icon'
import * as Fetcher from '@/components/Fetchers'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@/components/helpers/users'
import { useSession, signIn } from 'next-auth/react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
const Action = ({ ...props }: any) => {
    const onDeleteClick = () => {
        if (confirm('are you sure you want to do this?')) {
            props.deleteUser(props.row.original)
        }
    }
    if (userHasPermission(props.user, AVAILABLE_PERMISSIONS.editUsers)) {
        return (
            <div className='relative flex items-center gap-2'>
                <Link href={`/editUser/${props.row.original.id}`} className='cursor-pointer'>
                    <EditIcon />
                </Link>
                <DeleteIcon onClick={onDeleteClick} />
            </div>
        )
    } else {
        return <> </>
    }
}

const columnHelper = createColumnHelper<UserDataType>()

const UsersTable = (props: any) => {
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            signIn()
        }
    })
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { users, usersIsError, usersIsValidating } = Fetcher.Users(club)

    const [sorting, setSorting] = useState<SortingState>([
        {
            id: 'number',
            desc: false
        }
    ])

    const deleteUser = (data: any) => {
        props.deleteUser(data)
    }

    var data = users
    if (data == undefined) {
        data = []
    }

    const loadingState = usersIsValidating ? 'loading' : 'idle'

    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('displayName', {
                id: 'number',
                cell: info => info.getValue(),
                enableSorting: true
            }),
            columnHelper.accessor('id', {
                id: 'Edit',
                header: 'Action',
                cell: props => <Action {...props} id={props.row.original.id} deleteUser={deleteUser} user={session!.user} />
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
            <Table aria-label='Upcoming Races Table'>
                <TableHeader>
                    <TableRow>
                        {table
                            .getHeaderGroups()
                            .flatMap(headerGroup => headerGroup.headers)
                            .map(header => {
                                return <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                            })}
                    </TableRow>
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

export default UsersTable
