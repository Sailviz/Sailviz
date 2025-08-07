'use client'
import React from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, RowSelection, useReactTable } from '@tanstack/react-table'
import Select from 'react-select'
import * as Fetcher from '@/components/Fetchers'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@/components/helpers/users'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import * as DB from '@/components/apiMethods'
import { useSession } from '@/lib/auth-client'
import EditFleetSettingsDialog from '../layout/dashboard/EditFleetSettingsModal'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
const Boats = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState<BoatDataType[]>(initialValue)
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

const Action = ({ user, fleetSettings, seriesId, mutate }: { user: UserDataType; fleetSettings: FleetSettingsType; seriesId: string; mutate: any }) => {
    const onDeleteClick = async () => {
        if (confirm('are you sure you want to do this?')) {
            let res = await DB.DeleteFleetSettingsById(fleetSettings.id)
            if (res) {
                console.log('Fleet settings deleted successfully')
                mutate() // Refresh the fleet settings
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

const customStyles = { multiValueRemove: (base: any) => ({ ...base, display: 'none' }) }

const columnHelper = createColumnHelper<FleetSettingsType>()

const FleetTable = ({ seriesId }: { seriesId: string }) => {
    const { fleetSettings, fleetSettingsIsError, fleetSettingsIsValidating, mutateFleetSettings } = Fetcher.GetFleetSettingsBySeriesId(seriesId)
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()

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
                cell: props => <Action fleetSettings={props.row.original} seriesId={seriesId} user={session!.user} mutate={mutateFleetSettings} />
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
