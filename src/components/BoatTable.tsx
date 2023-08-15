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

const Text = ({ ...props }) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)

    const onBlur = (e: ChangeEvent<HTMLInputElement>) => {
        const original = props.row.original
        original[props.column.id] = e.target.value
        props.updateBoat(original)
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

const Remove = ({ ...props }: any) => {
    const onClick = () => {
        console.log(props.row.original)
        props.deleteBoat(props.row.original)
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

    const deleteBoat = (id: any) => {
        props.deleteBoat(id)
        const tempdata: ResultsDataType[] = [...data]
        tempdata.splice(tempdata.findIndex((x: ResultsDataType) => x.id === id), 1)
        setData(tempdata)
    }


    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('name', {
                header: "name",
                cell: props => <Text {...props} updateBoat={updateBoat} />,
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
            columnHelper.display({
                id: "Remove",
                cell: props => <Remove {...props} deleteBoat={deleteBoat} />
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