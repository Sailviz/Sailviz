import React, { ChangeEvent, MouseEventHandler, useEffect, useState } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, RowSelection, useReactTable } from '@tanstack/react-table'
import Select from 'react-select';

const Boats = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState<BoatDataType[]>(initialValue)
    let boats: { value: string, label: string }[] = []

    if (value) {
        value.forEach(boat => {
            boats.push({ value: "", label: boat.name })
        });
    }

    return (
        <div className="w-full p-2 mx-0 my-2">
            <Select
                styles={customStyles}
                id="editClass"
                className=' w-full h-full text-3xl'
                value={boats}
                isMulti={true}
                isClearable={false}
                isDisabled={true}
            />
        </div>
    );
};

const Edit = ({ ...props }: any) => {
    const onClick = () => {
        props.showFleetModal(props.id)
    }
    return (
        <p className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0"
            onClick={onClick} >
            Edit
        </p>
    );

};

const customStyles = { multiValueRemove: (base: any) => ({ ...base, display: 'none' }) }

const columnHelper = createColumnHelper<FleetSettingsType>()


const FleetTable = (props: any) => {
    var [data, setData] = useState(props.data)

    const showFleetModal = (data: any) => {
        props.showFleetModal(data)
    }

    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('name', {
                id: "name",
                cell: info => info.getValue(),
            }),
            columnHelper.accessor('startDelay', {
                id: "start Delay",
                cell: info => info.getValue(),
            }),
            columnHelper.accessor('boats', {
                id: "boats",
                cell: props => <Boats {...props} />,
            }),
            columnHelper.accessor('id', {
                id: "Edit",
                cell: props => <Edit {...props} id={props.row.original.id} showFleetModal={showFleetModal} />
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

export default FleetTable