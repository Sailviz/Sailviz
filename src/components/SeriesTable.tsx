import React, { useState } from 'react';
import dayjs from 'dayjs';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import * as DB from './apiMethods';


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

const Time = ({ ...props }: any) => {
    const initialValue = props.getValue()
    // We need to keep and update the state of the cell normally
    const [value, setValue] = React.useState(initialValue)

    // When the input is blurred, we'll call our table meta's updateData function
    const onBlur = () => {
        //table.options.meta?.updateData(props.index, props.id, value)
        //DB.updateRaceSettings(props.time)
        console.log(value)
        var raceData: RaceDataType = props.row.original
        console.log(raceData.id)
        var time = value.replace('T', ' ')
        var day = dayjs(time)
        if (day.isValid()) {
            raceData.Time = time
            DB.updateRaceSettings(raceData)
        }
    }

    // If the initialValue is changed external, sync it up with our state
    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])
    return (
        <>
            <input type="datetime-local"
                id='Time'
                className="w-full"
                value={dayjs(props.time).format('YYYY-MM-DDTHH:ss')}
                onChange={e => setValue(e.target.value)}
                onBlur={onBlur}
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
        cell: props => <Time {...props} />
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