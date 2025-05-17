'use client'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip, user } from '@nextui-org/react'
import { EyeIcon } from '@/components/icons/eye-icon'
import { EditIcon } from '@/components/icons/edit-icon'
import { DeleteIcon } from '@/components/icons/delete-icon'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@/components/helpers/users'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'

const Action = ({ ...props }: any) => {
    const onDeleteClick = () => {
        if (confirm('are you sure you want to do this?')) {
            props.deleteSeries(props.row.original.id)
        }
    }
    const onEditClick = () => {
        props.editSeries(props.row.original.id)
    }
    return (
        <div className='relative flex items-center gap-2'>
            <Tooltip content='View'>
                <span className='text-lg text-default-400 cursor-pointer active:opacity-50'>
                    <EyeIcon onClick={() => props.viewSeries(props.row.original.id)} />
                </span>
            </Tooltip>
            {userHasPermission(props.user, AVAILABLE_PERMISSIONS.editSeries) ? (
                <>
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
                </>
            ) : (
                <></>
            )}
        </div>
    )
}

const columnHelper = createColumnHelper<SeriesDataType>()

const ClubTable = () => {
    const { data: session, status } = useSession()
    const [data, setData] = useState<SeriesDataType[]>([])
    const loadingState = data?.length === 0 ? 'loading' : 'idle'

    const Router = useRouter()

    const viewSeries = (seriesId: string) => {
        Router.push('/Series/' + seriesId)
    }

    const deleteSeries = async (seriesId: string) => {
        await DB.deleteSeriesById(seriesId)
    }

    const editSeries = async (series: SeriesDataType) => {
        await DB.updateSeries(series)
    }

    useEffect(() => {
        const fetchData = async () => {
            if (session) {
                const series = await DB.GetSeriesByClubId(session.user.clubId)
                setData(series)
            }
        }
        fetchData()
    }, [session])

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
                cell: props => (
                    <Action {...props} id={props.row.original.id} deleteSeries={deleteSeries} viewSeries={viewSeries} editSeries={editSeries} user={session!.user} />
                )
            })
        ],
        getCoreRowModel: getCoreRowModel()
    })
    return (
        <div>
            <Table isStriped id={'clubTable'} aria-label='table of series'>
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

export default ClubTable
