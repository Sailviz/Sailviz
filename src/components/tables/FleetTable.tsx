'use client'
import React, { ChangeEvent, MouseEventHandler, useEffect, useState } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, RowSelection, useReactTable } from '@tanstack/react-table'
import Select from 'react-select'
import * as Fetcher from '@/components/Fetchers'
import { EditIcon } from '@/components/icons/edit-icon'
import { DeleteIcon } from '@/components/icons/delete-icon'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@/components/helpers/users'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useSession } from '@/lib/auth-client'
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
            <Select styles={customStyles} id='editClass' className=' w-full h-full text-3xl' value={boats} isMulti={true} isClearable={false} isDisabled={true} />
        </div>
    )
}

const Action = ({ ...props }: any) => {
    const onDeleteClick = () => {
        if (confirm('are you sure you want to do this?')) {
            props.remove(props.row.original.id)
        }
    }
    return (
        <div className='relative flex items-center gap-2'>
            {userHasPermission(props.user, AVAILABLE_PERMISSIONS.editFleets) ? (
                <>
                    <Link href={`/editFleet/${props.id}`}>
                        <EditIcon />
                    </Link>

                    <DeleteIcon onClick={onDeleteClick} />
                </>
            ) : (
                <></>
            )}
        </div>
    )
}

const customStyles = { multiValueRemove: (base: any) => ({ ...base, display: 'none' }) }

const columnHelper = createColumnHelper<FleetSettingsType>()

const FleetTable = (props: any) => {
    const { fleetSettings, fleetSettingsIsError, fleetSettingsIsValidating } = Fetcher.GetFleetSettingsBySeriesId(props.seriesId)
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()
    console.log(props.data)

    const remove = (data: any) => {
        props.remove(data)
    }

    var data = fleetSettings
    if (data == undefined) {
        data = []
    }

    const loadingState = fleetSettingsIsValidating ? 'loading' : 'idle'

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
                cell: props => <Action {...props} id={props.row.original.id} remove={remove} user={session?.user} />
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
