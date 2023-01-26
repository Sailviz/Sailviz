import React, { useState } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

type RaceDataType = {
    [key: string]: any,
    id: string,
    number: number,
    OOD: string,
    AOD: string,
    SO: string,
    ASO: string,
    results: ResultsType[],
    Time: string,
    Type: string,
    seriesId: string
};

type ResultsType = {
    [key: string]: any,
    Helm: string,
    Crew: string,
    BoatClass: string,
    BoatNumber: string,
    Time: number,
    Laps: number,
    Position: number
}

const columnHelper = createColumnHelper<ResultsType>()

const columns = [
    columnHelper.accessor('Helm', {
        header: "Helm",
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('Crew', {
        id: "Crew",
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('BoatClass', {
        id: "Boat Class",
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('BoatNumber', {
        id: "Sail Number",
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('Time', {
        header: "Time",
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('Laps', {
        header: "Laps",
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('Position', {
        header: "Position",
        cell: info => info.getValue(),
    }),
]


const RaceResultsTable = (props: any) => {
    var [data, setData] = useState(props.data.results)
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
                                    <input defaultValue={cell.getValue() as string} id={cell.id} className={'w-full'} />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default RaceResultsTable