import { useEffect, useState } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, type SortingState, useReactTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { client } from '@sailviz/auth/client'

type OrgMembership = {
    id: string
    name: string
    organizationId: string
    orgName: string
    createdAt: Date
    updatedAt?: Date | undefined
}

const columnHelper = createColumnHelper<OrgMembership>()

const MembershipsTable = ({ userId }: { userId: string }) => {
    const [data, setData] = useState<OrgMembership[]>([])

    useEffect(() => {
        async function fetchUsers() {
            const { data } = await client.organization.listUserTeams({
                query: {
                    userId: userId
                }
            })

            console.log('Fetched members:', data)
            if (!data) {
                setData([])
                return
            }
            const enriched = await Promise.all(
                data.map(async membership => {
                    const orgData = await client.organization.getFullOrganization({
                        query: { organizationId: membership.organizationId }
                    })

                    return {
                        ...membership,
                        orgName: orgData.data?.name || 'Unknown'
                    }
                })
            )
            setData(enriched)
        }
        fetchUsers()
    }, [])

    const [sorting, setSorting] = useState<SortingState>([
        {
            id: 'Name',
            desc: false
        }
    ])

    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor(org => org.orgName, {
                id: 'Name',
                cell: info => info.getValue(),
                enableSorting: true
            }),
            columnHelper.accessor(org => org.name, {
                id: 'Role',
                cell: info => info.getValue(),
                enableSorting: true
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

export default MembershipsTable
