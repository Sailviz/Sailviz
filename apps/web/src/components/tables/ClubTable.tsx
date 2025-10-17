import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@components/helpers/users'
import { useLoaderData, useNavigate } from '@tanstack/react-router'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { type SeriesType } from '@sailviz/types'
import { Button } from '../ui/button'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'

const Action = ({ seriesId, viewHref, user }: { seriesId: string; viewHref: string; user?: UserDataType }) => {
    const navigate = useNavigate()
    const seriesDeletion = useMutation(orpcClient.series.delete.mutationOptions())
    const queryClient = useQueryClient()

    const onDeleteClick = async () => {
        if (confirm('are you sure you want to do this?')) {
            await seriesDeletion.mutateAsync({ seriesId: seriesId })
            queryClient.invalidateQueries({
                queryKey: orpcClient.series.club.key({ type: 'query' })
            })
        }
    }

    return (
        <div className='relative flex items-center gap-2'>
            <Button className='w-16 h-8 p-0' onClick={() => navigate({ to: viewHref + seriesId })}>
                View
            </Button>

            {userHasPermission(user, AVAILABLE_PERMISSIONS.editSeries) ? (
                <>
                    {/* <EditIcon onClick={onEditClick} className='cursor-pointer' /> */}
                    <Button onClick={onDeleteClick} variant={'outline'}>
                        Remove
                    </Button>
                </>
            ) : (
                <></>
            )}
        </div>
    )
}

const columnHelper = createColumnHelper<SeriesType>()

const ClubTable = ({ viewHref, clubId }: { viewHref: string; clubId?: string }) => {
    const session = useLoaderData({ from: `__root__` })

    // if a clubId is provided then use that, otherwise use the session club id
    const clubIdToUse = clubId || session?.club!.id || ''
    const { data: series } = useQuery(orpcClient.series.club.queryOptions({ input: { clubId: clubIdToUse, includeRaces: true } }))

    const data = series || []
    console.log(data)
    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('name', {
                header: 'Series Name',
                cell: info => info.getValue()
            }),
            columnHelper.accessor(row => row.races.length.toString(), {
                id: 'Number of Races',
                cell: info => info.getValue()
            }),
            columnHelper.accessor('id', {
                id: 'Remove',
                header: 'Actions',
                cell: props => <Action seriesId={props.row.original.id} viewHref={viewHref} user={session?.user} />
            })
        ],
        getCoreRowModel: getCoreRowModel()
    })
    return (
        <div className='w-full'>
            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => {
                                    return (
                                        <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
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
        </div>
    )
}

export default ClubTable
