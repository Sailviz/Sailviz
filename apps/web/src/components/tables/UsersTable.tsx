import { useState } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, type SortingState, useReactTable } from '@tanstack/react-table'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@components/helpers/users'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { useLoaderData } from '@tanstack/react-router'
import { Button } from '../ui/button'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import type { UserType } from '@sailviz/types'
import EditUserDialog from '@components/layout/dashboard/EditUserModal'

const Action = ({ user, session, onClick }: { user: UserType; session: any; onClick: (user: UserType) => void }) => {
    if (userHasPermission(session.user, AVAILABLE_PERMISSIONS.editUsers)) {
        return (
            <div className='relative flex items-center gap-2 cursor-pointer'>
                <Button onClick={() => onClick(user)}>Edit</Button>
            </div>
        )
    } else {
        return <> </>
    }
}

const columnHelper = createColumnHelper<UserType>()

const UsersTable = () => {
    const session = useLoaderData({ from: `__root__` })

    const { data: club } = useQuery(orpcClient.club.session.queryOptions())
    const { data: users } = useQuery(orpcClient.user.club.queryOptions({ input: { clubId: club?.id || '' } }))
    const { data: roles } = useQuery(orpcClient.role.club.queryOptions({ input: { clubId: club?.id || '' } }))

    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [modalData, setModalData] = useState<UserType | undefined>(undefined)

    function onEdit(user: UserType) {
        setModalData(user)
        setModalIsOpen(true)
    }

    const [sorting, setSorting] = useState<SortingState>([
        {
            id: 'number',
            desc: false
        }
    ])

    var data = users
    if (data == undefined) {
        data = []
    }

    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('username', {
                id: 'number',
                cell: info => info.getValue(),
                enableSorting: true
            }),
            columnHelper.accessor('id', {
                id: 'Edit',
                header: 'Action',
                cell: props => <Action user={props.row.original} session={session!} onClick={onEdit} />
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
            <EditUserDialog open={modalIsOpen} user={modalData!} clubRoles={roles!} onClose={() => setModalIsOpen(false)} />
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
