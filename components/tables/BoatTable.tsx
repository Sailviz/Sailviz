import React, { ChangeEvent, useState } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, getFilteredRowModel } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Dropdown, DropdownItem, DropdownTrigger, Button, DropdownMenu, Input, Tooltip, Spinner } from '@nextui-org/react';
import { VerticalDotsIcon } from 'components/icons/vertical-dots-icon';
import { EyeIcon } from 'components/icons/eye-icon';
import { EditIcon } from 'components/icons/edit-icon';
import { DeleteIcon } from 'components/icons/delete-icon';
import { SearchIcon } from 'components/icons/search-icon';
import * as Fetcher from 'components/Fetchers';
import { AVAILABLE_PERMISSIONS, userHasPermission } from 'components/helpers/users';

const columnHelper = createColumnHelper<BoatDataType>()

const Number = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)

    return (
        <div className=''>
            {value}
        </div>
    );
};

const Text = ({ ...props }) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)

    return (
        <div className=''>
            {value}
        </div>
    );
};

const StartTime = ({ ...props }: any) => {
    const initialValue = props.getValue()
    //change to minutes:seconds
    const time = new Date(initialValue * 1000).toISOString().substr(14, 5)
    const [value, setValue] = React.useState(time)

    return (
        <div className=''>
            {value}
        </div>
    );
};

function Filter({ column, table }: { column: any, table: any }) {
    const columnFilterValue = column.getFilterValue();


    return (
        <Input
            isClearable
            className="w-full"
            placeholder="Search by name..."
            startContent={<SearchIcon />}
            value={column.getFilterValue()}
            onClear={() => column.setFilterValue("")}
            onValueChange={(value) => column.setFilterValue(value)}
            //so that you can type a space, otherwise it will be blocked
            onKeyDown={(e: any) => { if (e.key === " ") { e.stopPropagation() } }}
        />
    );
}

const Action = ({ ...props }: any) => {
    const onDeleteClick = () => {
        if (confirm("are you sure you want to do this?")) {
            props.deleteBoat(props.row.original)
        }
    }

    const onEditClick = () => {
        props.editBoat(props.row.original)
    }
    if (userHasPermission(props.user, AVAILABLE_PERMISSIONS.editBoats)) {
        return (
            <div className="relative flex items-center gap-2">
                <Tooltip content="Edit">
                    <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                        <EditIcon onClick={onEditClick} />
                    </span>
                </Tooltip>
                <Tooltip color="danger" content="Delete" >
                    <span className="text-lg text-danger cursor-pointer active:opacity-50">
                        <DeleteIcon onClick={onDeleteClick} />
                    </span>
                </Tooltip>
            </div>
        );
    } else {
        return (<>  </>)
    }
};


const BoatTable = (props: any) => {
    const { boats, boatsIsError, boatsIsValidating } = Fetcher.Boats()
    const { user, userIsError, userIsValidating } = Fetcher.UseUser()

    const data = boats || []

    const editBoat = (boat: BoatDataType) => {
        props.editBoat(boat)
    }

    const deleteBoat = (id: any) => {
        props.deleteBoat(id)
    }

    const createBoat = () => {
        props.createBoat()
    }

    const loadingState = boatsIsValidating || data?.length === 0 ? "loading" : "idle";

    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('name', {
                header: "name",
                cell: props => <Text {...props} />,
                enableColumnFilter: true
            }),
            columnHelper.accessor('crew', {
                header: "crew",
                cell: props => <Number {...props} />,
                enableColumnFilter: false
            }),
            columnHelper.accessor('py', {
                id: "py",
                cell: props => <Number {...props} />,
                enableColumnFilter: false
            }),
            columnHelper.accessor('pursuitStartTime', {
                id: "pursuitStartTime",
                header: () => <span>Pursuit Start Time</span>,
                cell: props => <StartTime {...props} />,
                enableColumnFilter: false
            }),
            columnHelper.accessor('id', {
                id: "action",
                enableColumnFilter: false,
                header: "Action",
                cell: props => <Action {...props} id={props.row.original.id} deleteBoat={deleteBoat} editBoat={editBoat} user={user} />
            }),
        ],
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel()
    })

    return (
        <div key={props.data}>
            <Table
                isStriped
                classNames={{
                    base: "max-h-[520px] overflow-scroll",
                    table: "min-h-[420px]",
                }}>
                <TableHeader>
                    {table.getHeaderGroups().flatMap(headerGroup => headerGroup.headers).map(header => {
                        return (
                            <TableColumn key={header.id}>
                                <div className='flex justify-between flex-row'>
                                    <div className='py-3'>
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </div>
                                    {header.column.getCanFilter() ? (
                                        <div className='w-full'>
                                            <Filter column={header.column} table={table} />
                                        </div>
                                    ) : null}
                                </div>
                            </TableColumn>
                        );
                    })}
                </TableHeader>
                <TableBody
                    loadingContent={<Spinner />}
                    loadingState={loadingState}>
                    {table.getRowModel().rows.map(row => (
                        <TableRow key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <TableCell key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}

                </TableBody>
            </Table>
        </div>
    )
}

export default BoatTable