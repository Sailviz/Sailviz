import React from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@components/helpers/users'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table'
import EditFleetSettingsDialog from '@components/layout/dashboard/EditFleetSettingsModal'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import type { UserType } from '@sailviz/types'
import { useLoaderData } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import * as Types from '@sailviz/types'

const Boats = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value] = React.useState<Types.BoatType[]>(initialValue)
    let boats: { value: string; label: string }[] = []

    if (value) {
        value.forEach(boat => {
            boats.push({ value: '', label: boat.name })
        })
    }

    return (
        <div className='w-full p-2 mx-0 my-2'>
            {/* <Select styles={customStyles} id='editClass' className=' w-full h-full text-3xl' value={boats} isMulti={true} isClearable={false} isDisabled={true} /> */}
            {boats.map(boat => (
                <Badge className='bg-blue-500 text-white dark:bg-blue-700 m-2' key={boat.label}>
                    {boat.label}
                </Badge>
            ))}
        </div>
    )
}

const Action = ({ user, fleetSettings, seriesId }: { user: UserType; fleetSettings: FleetSettingsType; seriesId: string }) => {
    const deleteFleetSettings = useMutation(orpcClient.fleet.settings.delete.mutationOptions())
    const queryClient = useQueryClient()

    const onDeleteClick = async () => {
        if (confirm('are you sure you want to do this?')) {
            let res = await deleteFleetSettings.mutateAsync({ fleetSettingsId: fleetSettings.id })
            if (res) {
                console.log('Fleet settings deleted successfully')
                queryClient.invalidateQueries({
                    queryKey: orpcClient.fleet.settings.find.key({ type: 'query' })
                })
            } else {
                console.error('Failed to delete fleet settings')
            }
        }
    }
    return (
        <div className='relative flex items-center gap-2'>
            {userHasPermission(user, AVAILABLE_PERMISSIONS.editFleets) ? (
                <>
                    <EditFleetSettingsDialog fleetSettings={fleetSettings} seriesId={seriesId} />
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

const columnHelper = createColumnHelper<FleetSettingsType>()

const FleetTable = ({ seriesId }: { seriesId: string }) => {
    const session = useLoaderData({ from: `__root__` })

    const { data: fleetSettings } = useQuery(orpcClient.fleet.settings.find.queryOptions({ input: { seriesId: seriesId } }))

    var data = fleetSettings
    if (data == undefined) {
        data = []
    }

    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('name', {
                id: 'name',
                cell: info => info.getValue()
            }),
            columnHelper.accessor('boats', {
                id: 'boats',
                cell: props => <Boats {...props} />
            }),
            columnHelper.accessor('id', {
                id: 'Edit',
                header: 'Actions',
                cell: props => <Action fleetSettings={props.row.original} seriesId={seriesId} user={session!.user} />
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
                                <TableCell className='h-24 text-center'>No results.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default FleetTable
