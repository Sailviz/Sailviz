import React, { Component, useState } from 'react';

import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

type SettingsType = {
    numberOfRaces: number,
    numberToCount: number
}

type SeriesDataType = {
    id: string,
    name: string,
    clubId: string,
    settings: SettingsType,
    races: []
}

const columnHelper = createColumnHelper<SeriesDataType>()

const columns = [
    columnHelper.accessor('name', {
        header: "name",
        cell: info => info.getValue(),
    }),
    columnHelper.accessor(row => row.settings['numberOfRaces'], {
        id: "Number of Races",
        cell: info => info.getValue(),
    }),
    columnHelper.accessor(row => row.settings['numberToCount'], {
        id: "Number to Count",
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
        <div className="p-2" key={props.data}>
            <table>
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id}>
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
                                <td key={cell.id}>
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