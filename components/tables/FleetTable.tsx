import React, { ChangeEvent, MouseEventHandler, useEffect, useState } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, RowSelection, useReactTable } from '@tanstack/react-table'
import Select from 'react-select'
import {
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Dropdown,
    DropdownItem,
    DropdownTrigger,
    Button,
    DropdownMenu,
    Spinner,
    Tooltip
} from '@nextui-org/react'
import * as Fetcher from 'components/Fetchers'
import { EditIcon } from 'components/icons/edit-icon'
import { DeleteIcon } from 'components/icons/delete-icon'
import { AVAILABLE_PERMISSIONS, userHasPermission } from 'components/helpers/users'

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
    const onEditClick = () => {
        props.edit(props.row.original)
    }

    const onDeleteClick = () => {
        if (confirm('are you sure you want to do this?')) {
            props.remove(props.row.original.id)
        }
    }
    return (
        <div className='relative flex items-center gap-2'>
            {userHasPermission(props.user, AVAILABLE_PERMISSIONS.editFleets) ? (
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

const customStyles = { multiValueRemove: (base: any) => ({ ...base, display: 'none' }) }

const columnHelper = createColumnHelper<FleetSettingsType>()

const FleetTable = (props: any) => {
    const { fleetSettings, fleetSettingsIsError, fleetSettingsIsValidating } = Fetcher.GetFleetSettingsBySeriesId(props.seriesId)
    const { user, userIsError, userIsValidating } = Fetcher.UseUser()
    console.log(props.data)

    const edit = (data: any) => {
        props.edit(data)
    }

    const remove = (data: any) => {
        props.remove(data)
    }

    var data = fleetSettings
    if (data == undefined) {
        data = []
    }

    const loadingState = fleetSettingsIsValidating || userIsValidating ? 'loading' : 'idle'

    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('name', {
                id: 'name',
                cell: info => info.getValue()
            }),
            columnHelper.accessor('startDelay', {
                id: 'start Delay',
                cell: info => info.getValue()
            }),
            columnHelper.accessor('boats', {
                id: 'boats',
                cell: props => <Boats {...props} />
            }),
            columnHelper.accessor('id', {
                id: 'Edit',
                cell: props => <Action {...props} id={props.row.original.id} edit={edit} remove={remove} user={user} />
            })
        ],
        getCoreRowModel: getCoreRowModel()
    })
    return (
        <div key={props.data}>
            <Table isStriped id={'clubTable'} aria-label='Fleet Table'>
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

export default FleetTable
