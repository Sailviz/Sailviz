import { useEffect, useState } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, type SortingState, useReactTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import * as Types from '@sailviz/types'
import { client } from '@sailviz/auth/client'
import EditTeamDialog from '@components/layout/dashboard/EditTeamModal'
const Action = ({ member, onClick }: { member: Types.Team; onClick: (member: Types.Team) => void }) => {
    return (
        <div className='relative flex items-center gap-2 cursor-pointer'>
            <Button onClick={() => onClick(member)}>Edit</Button>
        </div>
    )
}

const columnHelper = createColumnHelper<Types.Team>()

const TeamsTable = ({ orgId }: { orgId: string }) => {
    const [data, setData] = useState<Types.Team[]>([])

    useEffect(() => {
        async function fetchUsers() {
            const { data } = await client.organization.listTeams({
                query: {
                    organizationId: orgId
                }
            })
            setData(data!)
        }
        fetchUsers()
    }, [])

    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [modalData, setModalData] = useState<Types.Team | undefined>(undefined)

    function onEdit(member: Types.Team) {
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
            columnHelper.accessor(team => team.name, {
                id: 'Name',
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
            <EditTeamDialog open={modalIsOpen} team={modalData!} onClose={() => setModalIsOpen(false)} />
            <Table aria-label='Teams Table'>
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

export default TeamsTable
