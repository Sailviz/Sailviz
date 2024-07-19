import React, { ChangeEvent, useState } from 'react';
import dayjs from 'dayjs';
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, RowSelection, SortingState, useReactTable } from '@tanstack/react-table'
import * as DB from './apiMethods';
import Select from 'react-select';


const Remove = ({ ...props }: any) => {
    const onClick = () => {
        props.removeRace(props.id)
    }
    return (
        <p className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0"
            onClick={onClick} >
            Remove
        </p>
    );

};

const GoTo = ({ ...props }: any) => {
    const onClick = () => {
        props.goToRace(props.id)
    }
    return (
        <p className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0"
            onClick={onClick} >
            GoTo
        </p>
    );

};

const columnHelper = createColumnHelper<UserDataType>()

const UsersTable = (props: any) => {
    var [data, setData] = useState(props.data)

    const [sorting, setSorting] = useState<SortingState>([{
        id: "number",
        desc: false,
    }]);

    const updateData = (data: any) => {
        props.removeRace(data)
    }

    const goToRace = (data: any) => {
        props.goToRace(data)
    }

    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('displayName', {
                id: "number",
                cell: info => info.getValue(),
                enableSorting: true
            }),
            columnHelper.accessor('id', {
                id: "GoTo",
                header: "GoTo",
                cell: props => <GoTo {...props} id={props.row.original.id} goToRace={goToRace} />
            }),
        ],
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })
    return (
        <div key={props.data}>
            <table>
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id} className='border-4 p-1'>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id} className='border-4 p-2'>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default UsersTable