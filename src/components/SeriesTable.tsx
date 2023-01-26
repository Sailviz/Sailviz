import React, { useState } from 'react';
import dayjs from 'dayjs';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { info } from 'console';
import { clearLine } from 'readline';
import { defaultProps } from 'react-select/dist/declarations/src/Select';

type RaceDataType = {
    [key: string]: any,
    id: string,
    number: number,
    OOD: string,
    AOD: string,
    SO: string,
    ASO: string,
    results: any,
    Time: string,
    Type: string,
    seriesId: string
};

const Time = ({ time }: any) => {
    // Loop through the array and create a badge-like component instead of a comma-separated string
    return (
        <>
            <input type="datetime-local"
                id='Time'
                className="w-full"
                defaultValue={dayjs(time).format('YYYY-MM-DDTHH:ss')}
            />
        </>
    );
};


const columnHelper = createColumnHelper<RaceDataType>()

const columns = [
    columnHelper.accessor('number', {
        id: "number",
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('Time', {
        id: "Number of Races",
        cell: info => <Time values={info.getValue()} />
    }),
    columnHelper.accessor('Type', {
        id: "Type",
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('OOD', {
        id: "OOD",
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('AOD', {
        id: "AOD",
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('SO', {
        id: "SO",
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('ASO', {
        id: "ASO",
        cell: info => info.getValue(),
    }),
]


const SeriesTable = (props: any) => {
    var [data, setData] = useState(props.data)
    console.log(data)
    var table = useReactTable({
        data,
        columns,
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

export default SeriesTable