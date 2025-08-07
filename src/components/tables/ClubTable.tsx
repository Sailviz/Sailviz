'use client'
import React from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@/components/helpers/users'
import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { useSession } from '@/lib/auth-client'
import * as Fetcher from '@/components/Fetchers'
import { mutate } from 'swr'
import { Button } from '../ui/button'

const Action = ({ seriesId, viewHref, user }: { seriesId: string; viewHref: string; user: UserDataType }) => {
    const Router = useRouter()

    const onDeleteClick = async () => {
        if (confirm('are you sure you want to do this?')) {
            await DB.deleteSeriesById(seriesId)
            mutate('/api/GetSeriesByClubId') // This will revalidate the series data
        }
    }

    return (
        <div className='relative flex items-center gap-2'>
            <Button onClick={() => Router.push('/Series/' + seriesId)}>View</Button>

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

const columnHelper = createColumnHelper<SeriesDataType>()

const ClubTable = ({ viewHref }: { viewHref: string }) => {
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()
    const { series, seriesIsError, seriesIsValidating } = Fetcher.GetSeriesByClubId(session?.club!)
    // const [data, setData] = useState<SeriesDataType[]>([])

    const data = series || []

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
            columnHelper.accessor(row => row.settings['numberToCount'], {
                id: 'Races to Count',
                cell: info => info.getValue()
            }),
            columnHelper.accessor('id', {
                id: 'Remove',
                header: 'Actions',
                cell: props => <Action seriesId={props.row.original.id} viewHref={viewHref} user={session!.user} />
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

export default ClubTable
