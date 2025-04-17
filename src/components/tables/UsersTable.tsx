import React, { ChangeEvent, useState } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, RowSelection, SortingState, useReactTable } from '@tanstack/react-table'
import {
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Dropdown,
    DropdownItem,
    DropdownTrigger,
    Button,
    DropdownMenu,
    Tooltip,
    Spinner
} from '@nextui-org/react'
import { EditIcon } from '@/components/icons/edit-icon'
import { DeleteIcon } from '@/components/icons/delete-icon'
import * as Fetcher from '@/components/Fetchers'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@/components/helpers/users'

const Action = ({ ...props }: any) => {
    const onEditClick = () => {
        props.edit(props.row.original)
    }

    const onDeleteClick = () => {
        if (confirm('are you sure you want to do this?')) {
            props.deleteUser(props.row.original)
        }
    }
    if (userHasPermission(props.user, AVAILABLE_PERMISSIONS.editUsers)) {
        return (
            <div className='relative flex items-center gap-2'>
                <Tooltip content='Edit'>
                    <span className='text-lg text-default-400 cursor-pointer active:opacity-50'>
                        <EditIcon onClick={onEditClick} />
                    </span>
                </Tooltip>
                <Tooltip color='danger' content='Delete'>
                    <span className='text-lg text-danger cursor-pointer active:opacity-50'>
                        <DeleteIcon onClick={onDeleteClick} />
                    </span>
                </Tooltip>
            </div>
        )
    } else {
        return <> </>
    }
}

const columnHelper = createColumnHelper<UserDataType>()

const UsersTable = (props: any) => {
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { users, usersIsError, usersIsValidating } = Fetcher.Users(club)
    const { user, userIsError, userIsValidating } = Fetcher.UseUser()

    const [sorting, setSorting] = useState<SortingState>([
        {
            id: 'number',
            desc: false
        }
    ])

    const edit = (data: any) => {
        props.edit(data)
    }

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
                cell: props => <Action {...props} id={props.row.original.id} edit={edit} deleteUser={deleteUser} user={user} />
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
        <div key={props.data}>
            <Table isStriped id={'clubTable'} aria-label='Users Table'>
                <TableHeader>
                    {table
                        .getHeaderGroups()
                        .flatMap(headerGroup => headerGroup.headers)
                        .map(header => {
                            return <TableColumn key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableColumn>
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

export default UsersTable
