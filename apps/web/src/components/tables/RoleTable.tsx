import { useState } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, type SortingState, useReactTable } from '@tanstack/react-table'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@components/helpers/users'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import type { RoleType } from '@sailviz/types'
import { useLoaderData } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import EditRoleDialog from '@components/layout/dashboard/EditRoleModal'

const Action = ({ session, role, onClick }: { session: any; role: RoleDataType; onClick: (role: RoleType) => void }) => {
    if (userHasPermission(session.user, AVAILABLE_PERMISSIONS.editRoles)) {
        return (
            <div className='relative flex items-center gap-2'>
                <Button onClick={() => onClick(role)}>Edit</Button>
            </div>
        )
    } else {
        return <> </>
    }
}

const columnHelper = createColumnHelper<RoleDataType>()

const UsersTable = () => {
    const session = useLoaderData({ from: `__root__` })

    const { data: club } = useQuery(orpcClient.club.session.queryOptions())
    const { data: roles } = useQuery(orpcClient.role.club.queryOptions({ input: { clubId: club?.id || '' } }))

    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [modalData, setModalData] = useState<RoleType | undefined>(undefined)

    const [sorting, setSorting] = useState<SortingState>([
        {
            id: 'number',
            desc: false
        }
    ])

    function onEdit(user: RoleType) {
        setModalData(user)
        setModalIsOpen(true)
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
                cell: props => <Action role={props.row.original} session={session!} onClick={onEdit} />
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
            <EditRoleDialog open={modalIsOpen} role={modalData!} onClose={() => setModalIsOpen(false)} />
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
