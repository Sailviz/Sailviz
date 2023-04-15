import React, { useState } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import * as DB from './apiMethods';

const Remove = ({ ...props }: any) => {
    const onClick = () => {
        if (!confirm("are you sure you want to do this?")) return
        console.log(props.id)
        DB.deleteSeries(props.id)
        console.log(props.table.options.data)
        props.removeSeries(props.id)
    }
    return (
        <>
            <p className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0"
                onClick={onClick} >
                Remove
            </p>
        </>
    );
};

const columnHelper = createColumnHelper<SeriesDataType>()

const ClubTable = (props: any) => {
    var [data, setData] = useState(props.data)

    const updateData = (data: any) => {
        console.log(data)
        setData(data)
        props.removeSeries(data)
    }

    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('name', {
                header: "name",
                cell: info => info.getValue(),
            }),
            columnHelper.accessor(row => row.races.length.toString(), {
                id: "Number of Races",
                cell: info => info.getValue(),
            }),
            columnHelper.accessor(row => row.settings['numberToCount'], {
                id: "Number to Count",
                cell: info => info.getValue(),
            }),
            columnHelper.accessor('', {
                id: "Remove",
                cell: props => <Remove {...props} id={props.row.original.id} removeSeries={updateData} />
            }),
        ],
        getCoreRowModel: getCoreRowModel(),
    })
    return (
        <div key={props.data}>
            <table>
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id} className='border-4 p-2'>
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

export default ClubTable