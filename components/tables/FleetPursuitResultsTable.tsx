import React, { useState, useEffect } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, SortingState } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Dropdown, DropdownItem, DropdownTrigger, Button, DropdownMenu, Spinner } from '@nextui-org/react';
import { VerticalDotsIcon } from 'components/icons/vertical-dots-icon';
import * as Fetcher from 'components/Fetchers';

const Text = ({ ...props }) => {
    const value = props.getValue()

    return (
        <div >
            {value}
        </div>
    );
};


const Laps = ({ ...props }: any) => {
    const value = props.getValue()
    // value is the array of laps

    return (
        <div >
            {value.length}
        </div>
    );
};

const Class = ({ ...props }: any) => {
    let value = props.getValue()
    try {
        value = value.name
    } catch (error) {
        value = ""
    }

    return (
        <div>
            {value}
        </div>
    );
};

const Edit = ({ ...props }: any) => {
    const onClick = () => {
        //show edit modal
        props.showEditModal(props.row.original.id)
    }
    return (
        <>
            <p className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0"
                onClick={onClick} >
                Edit
            </p>
        </>
    );
};

function Sort({ column, table }: { column: any, table: any }) {
    const firstValue = table
        .getPreFilteredRowModel()
        .flatRows[0]?.getValue(column.id);

    const columnFilterValue = column.getFilterValue();

    return (
        <div className='flex flex-row justify-center'>
            <p onClick={(e) => column.toggleSorting(true)} className='cursor-pointer'>
                ▲
            </p>
            <p onClick={(e) => column.toggleSorting(false)} className='cursor-pointer'>
                ▼
            </p>
        </div>
    )
}


const columnHelper = createColumnHelper<ResultsDataType>()


const FleetPursuitResultsTable = (props: any) => {
    const { fleet, fleetIsValidating, fleetIsError } = Fetcher.Fleet(props.fleetId)
    let data = fleet?.results
    if (data == undefined) {
        data = []
    }
    let [editable, setEditable] = useState(props.editable)

    const showEditModal = (id: any) => {
        props.showEditModal(id)
    }

    const [sorting, setSorting] = useState<SortingState>([{
        id: "PursuitPosition",
        desc: false,
    }]);

    let columns = [
        columnHelper.accessor('Helm', {
            header: "Helm",
            cell: props => <Text {...props} />,
            enableSorting: false
        }),
        columnHelper.accessor('Crew', {
            header: "Crew",
            cell: props => <Text {...props} />,
            enableSorting: false
        }),
        columnHelper.accessor('boat', {
            header: "Class",
            id: "Class",
            size: 300,
            cell: props => <Class {...props} />,
            enableSorting: false
        }),
        columnHelper.accessor('SailNumber', {
            header: "Sail Number",
            cell: props => <Text {...props} />,
            enableSorting: false
        }),
        columnHelper.accessor('laps', {
            header: "Laps",
            cell: props => <Laps {...props} />,
            enableSorting: false
        }),
        columnHelper.accessor('PursuitPosition', {
            header: "Position",
            cell: props => <Text {...props} disabled={true} />,
            enableSorting: true
        })
    ]

    const editColumn = columnHelper.display({
        id: "Edit",
        cell: props => <Edit {...props} showEditModal={(id: string) => { showEditModal(id) }} />
    })

    if (editable) {
        columns.push(editColumn)
    }

    const loadingState = fleetIsValidating ? "loading" : "idle";

    let table = useReactTable({
        data,
        columns: columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })
    return (
        <div key={props.data}>
            <p className='text-2xl font-bol'>
                {fleet?.fleetSettings.name} - Boats Entered: {fleet?.results.length}
            </p>
            <Table isStriped id={"clubTable"}>
                <TableHeader>
                    {table.getHeaderGroups().flatMap(headerGroup => headerGroup.headers).map(header => {
                        return (
                            <TableColumn key={header.id}>
                                {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                )}
                            </TableColumn>
                        );
                    })}
                </TableHeader>
                <TableBody
                    loadingContent={<Spinner />}
                    loadingState={loadingState}
                    emptyContent={"No Entries Yet."}
                >
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

export default FleetPursuitResultsTable