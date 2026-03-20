import { useEffect, useState } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, type SortingState, useReactTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import * as Types from '@sailviz/types'
import { client } from '@sailviz/auth/client'
import { ActionButton } from '@components/ui/action-button'

const Action = ({ invitation, onClick }: { invitation: Types.Invitation; onClick: (id: string) => Promise<void> }) => {
    return (
        <div className='relative flex items-center gap-2 cursor-pointer'>
            <ActionButton before={'Accept'} during={'Accepting'} after={'Accepted'} action={() => onClick(invitation.id)} />
        </div>
    )
}

const columnHelper = createColumnHelper<Types.Invitation>()

const invitationsTable = () => {
    const [data, setData] = useState<Types.Invitation[]>([])

    useEffect(() => {
        async function fetchInvitations() {
            let { data: invitations } = await client.organization.listUserInvitations()
            console.log('Fetched invitations:', invitations)
            if (!invitations) return

            //filter out accepted invitations
            invitations = invitations.filter(invitation => invitation.status !== 'accepted')

            console.log('Final invitations with org names:', invitations)
            setData(invitations)
        }
        fetchInvitations()
    }, [])

    const acceptInvitation = async (id: string) => {
        const { error } = await client.organization.acceptInvitation({
            invitationId: id
        })
        if (error) {
            console.error('Error accepting invitation:', error)
            return
        }
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
            columnHelper.accessor(invitation => invitation.organizationName, {
                id: 'Name',
                cell: info => info.getValue(),
                enableSorting: true
            }),
            columnHelper.accessor('id', {
                id: 'Edit',
                header: 'Action',
                cell: props => <Action invitation={props.row.original} onClick={acceptInvitation} />
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
            <Table aria-label='invitations Table'>
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

export default invitationsTable
