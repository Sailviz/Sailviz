import React, { ChangeEvent, useState } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import * as DB from './apiMethods';

const Text = ({ ...props }) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)

    const onBlur = (e: ChangeEvent<HTMLInputElement>) => {
        const original = props.row.original
        original[props.column.id] = e.target.value
        props.updateSeries(original)
    }

    return (
        <>
            <input type="text"
                id=''
                className=" text-center"
                defaultValue={value}
                key={value}
                onBlur={(e) => onBlur(e)}
            />
        </>
    );
};

const Add = ({ ...props }) => {

    return (
        <>
            <div className="px-3 py-1 w-full">
                <p onClick={(e) => props.createSeries()} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0">
                    Add
                </p>
            </div>
        </>
    );
};

const Remove = ({ ...props }: any) => {
    const onClick = () => {
        if (confirm("are you sure you want to do this?")) {
            props.deleteSeries(props.row.original)
        }
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

    const updateSeries = (boat: SeriesDataType) => {
        //update local copy
        const tempdata = data
        tempdata[tempdata.findIndex((x: SeriesDataType) => x.id === boat.id)] = boat
        setData([...tempdata])

        //update main record and database
        props.updateSeries(boat)
    }

    const createSeries = () => {
        props.createSeries()
    }

    const deleteSeries = (series: SeriesDataType) => {
        console.log(series)
        props.deleteSeries(series)
        const tempdata: SeriesDataType[] = [...data]
        tempdata.splice(tempdata.findIndex((x: SeriesDataType) => x.id === series.id), 1)
        setData(tempdata)
    }

    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('name', {
                header: "name",
                cell: props => <Text {...props} updateSeries={updateSeries} />,
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
                header: _ => <Add {...props} createSeries={createSeries} />,
                cell: props => <Remove {...props} id={props.row.original.id} deleteSeries={deleteSeries} />
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