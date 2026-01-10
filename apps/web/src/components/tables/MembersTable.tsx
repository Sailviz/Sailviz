import { useEffect, useState } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, type SortingState, useReactTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import * as Types from '@sailviz/types'
import { client } from '@sailviz/auth/client'
import EditMemberDialog from '@components/layout/dashboard/EditMemberModal'

const Action = ({ member, onClick }: { member: Types.Member; onClick: (member: Types.Member) => void }) => {
    return (
        <div className='relative flex items-center gap-2 cursor-pointer'>
            <Button onClick={() => onClick(member)}>Edit</Button>
        </div>
    )
}

const columnHelper = createColumnHelper<Types.Member>()

const MembersTable = ({ orgId }: { orgId: string }) => {
    const [data, setData] = useState<Types.Member[]>([])

    useEffect(() => {
        async function fetchUsers() {
            const { data } = await client.organization.listMembers({
                query: {
                    organizationId: orgId
                }
            })

            console.log('Fetched members:', data?.members)
            setData(data!.members)
        }
        fetchUsers()
    }, [])

    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [modalData, setModalData] = useState<Types.Member | undefined>(undefined)

    function onEdit(member: Types.Member) {
        setModalData(member)
        setModalIsOpen(true)
    }

    const [sorting, setSorting] = useState<SortingState>([
        {
            id: 'number',
            desc: false
        }
    ])

    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor(member => member.user.name, {
                id: 'Name',
                cell: info => info.getValue(),
                enableSorting: true
            }),
            columnHelper.accessor('role', {
                id: 'Role',
                cell: info => info.getValue(),
                enableSorting: true
            }),
            columnHelper.accessor('id', {
                id: 'Edit',
                header: 'Action',
                cell: props => <Action member={props.row.original} onClick={onEdit} />
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
            <EditMemberDialog open={modalIsOpen} member={modalData!} onClose={() => setModalIsOpen(false)} />
            <Table aria-label='Members Table'>
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

export default MembersTable
