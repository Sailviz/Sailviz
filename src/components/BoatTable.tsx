import React, { ChangeEvent, useState } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, getFilteredRowModel } from '@tanstack/react-table'

const columnHelper = createColumnHelper<BoatDataType>()

const Number = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)

    const onBlur = (e: ChangeEvent<HTMLInputElement>) => {
        let boat = props.row.original
        boat[props.column.id] = parseInt(e.target.value)
        props.updateBoat(boat)
    }

    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])
    return (
        <>
            <input type="number"
                id=''
                className="p-2 text-center w-full"
                defaultValue={Math.round(value)}
                key={value}
                onBlur={(e) => onBlur(e)}
            />
        </>
    );
};


function Filter({ column, table }) {
    const firstValue = table
        .getPreFilteredRowModel()
        .flatRows[0]?.getValue(column.id);

    const columnFilterValue = column.getFilterValue();

    return typeof firstValue === "number" ? (
        <div>
            <input
                type="number"
                value={columnFilterValue?.[0] ?? ""}
                onChange={(e) =>
                    column.setFilterValue((old) => [e.target.value, old?.[1]])
                }
                placeholder={`Min`}
                className="table-min-max-filter-bar"
            />
            <input
                type="number"
                value={columnFilterValue?.[1] ?? ""}
                onChange={(e) =>
                    column.setFilterValue((old) => [old?.[0], e.target.value])
                }
                placeholder={`Max`}
                className="table-min-max-filter-bar"
            />
        </div>
    ) : (
        <input
            type="text"
            value={columnFilterValue ?? ""}
            onChange={(e) => column.setFilterValue(e.target.value)}
            placeholder={"Search..."}
            className="table-filter-bar border"
        />
    );
}




const BoatTable = (props: any) => {
    var [data, setData] = useState(props.data)

    const updateBoat = (boat: ResultsDataType) => {
        //update local copy
        const tempdata = data
        tempdata[tempdata.findIndex((x: ResultsDataType) => x.id === boat.id)] = boat
        setData([...tempdata])

        //update main record and database
        props.updateBoat(boat)
    }


    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('name', {
                header: "name",
                cell: info => info.getValue()
            }),
            columnHelper.accessor('crew', {
                header: "crew",
                cell: props => <Number {...props} updateBoat={updateBoat} />,
                enableColumnFilter: false
            }),
            columnHelper.accessor('py', {
                id: "py",
                cell: props => <Number {...props} updateBoat={updateBoat} />,
                enableColumnFilter: false
            }),
        ],
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel()
    })

    return (
        <div key={props.data} className='overflow-scroll h-64 overflow-x-hidden'>
            <table className='w-full'>
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
                                    {header.column.getCanFilter() ? (
                                        <div>
                                            <Filter column={header.column} table={table} />
                                        </div>
                                    ) : null}
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