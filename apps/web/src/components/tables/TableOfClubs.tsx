import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { EyeIcon } from '@components/icons/eye-icon'
import { useLoaderData, useNavigate } from '@tanstack/react-router'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table'
import { Button } from '@components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import * as Types from '@sailviz/types'

const Action = ({ ...props }: any) => {
    return (
        <div className='relative flex items-center gap-2'>
            <Button variant={'outline'} onClick={() => props.viewClub(props.row.original.id)}>
                <EyeIcon />
                View
            </Button>
        </div>
    )
}

const columnHelper = createColumnHelper<Types.Org>()

const TableOfClubs = () => {
    const session = useLoaderData({ from: `__root__` })
    const { data: clubs } = useQuery(orpcClient.organization.all.queryOptions())

    const navigate = useNavigate()

    const data = clubs || []

    console.log('Clubs:', data)

    const viewClub = (id: string) => {
        console.log('Viewing club with ID:', id)
        navigate({ to: `/admin/clubs/${id}` })
    }

    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('name', {
                header: 'Club Name',
                cell: info => info.getValue()
            }),
            columnHelper.accessor(data => data.stripeCustomerId || '', {
                header: 'Stripe Customer ID',
                cell: info => info.getValue()
            }),
            columnHelper.display({
                id: 'Edit',
                header: 'Edit',
                cell: props => <Action {...props} viewClub={viewClub} user={session!.user} />
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
