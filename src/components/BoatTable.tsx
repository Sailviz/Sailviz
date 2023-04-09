import React, { useState } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

type BoatDataType = {
    id: string,
    name: string,
    crew: number,
    py: number
}

const columnHelper = createColumnHelper<BoatDataType>()

const columns = [
    columnHelper.accessor('name', {
        header: "name",
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('crew', {
        header: "crew",
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('py', {
        id: "py",
        cell: info => info.getValue(),
    }),
]


const BoatTable = (props: any) => {
    var [data, setData] = useState(props.data)
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

export default BoatTable