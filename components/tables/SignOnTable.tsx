import React, { ChangeEvent, useState, useRef } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, SortingState } from '@tanstack/react-table'


function Sort({ column, table }: { column: any, table: any }) {
    const firstValue = table
        .getPreFilteredRowModel()
        .flatRows[0]?.getValue(column.id);

    const columnFilterValue = column.getFilterValue();

    return (
        <div className='flex flex-row justify-center'>
            <p onClick={(e) => column.toggleSorting(true)} className='cursor-pointer'>
                ▲
            </p>
            <p onClick={(e) => column.toggleSorting(false)} className='cursor-pointer'>
                ▼
            </p>
        </div>
    )
}


const columnHelper = createColumnHelper<ResultsDataType>()


const SignOnTable = (props: any) => {
    let [data, setData] = useState<ResultsDataType[]>(props.data)
    let clubId = props.clubId
    let raceId = props.raceId
    let options: object[] = []

    const Text = ({ ...props }) => {
        const initialValue = props.getValue()
        const [value, setValue] = React.useState(initialValue)

        return (
            <>
                <div className='p-2 m-2 text-center w-full text-2xl'>
                    {value}
                </div>

            </>
        );
    };

    const Number = ({ ...props }: any) => {
        const initialValue = props.getValue()
        const [value, setValue] = React.useState(initialValue)

        return (
            <>
                <div className='p-2 m-2 text-center w-full text-2xl'>
                    {value}
                </div>
            </>
        );
    };

    const Class = ({ ...props }: any) => {
        var initialValue = props.getValue()
        if (initialValue == null) {
            initialValue = { value: "", label: "" }
        }
        const [value, setValue] = React.useState(initialValue)

        const key = props.column.id + '_' + props.row.id

        return (
            <>
                <div className='p-2 m-2 text-center w-full text-2xl'>
                    {value.name}
                </div>
            </>
        );
    };

    const Edit = ({ ...props }: any) => {
        const onClick = () => {
            //show edit modal
            props.showEditModal(props.row.original.id)
        }
        return (
            <>
                <p className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0"
                    onClick={onClick} >
                    Edit
                </p>
            </>
        );
    };



    const deleteResult = (id: any) => {
        props.deleteResult(id)
    }

    const showEditModal = (id: any) => {
        props.showEditModal(id)
    }


    const [sorting, setSorting] = useState<SortingState>([]);

    let editableKeyToFocus = useRef("0")

    let table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('Helm', {
                header: "Helm",
                cell: props => <Text {...props} />,
                enableSorting: false
            }),
            columnHelper.accessor('Crew', {
                header: "Crew",
                cell: props => <Text {...props} />,
                enableSorting: false
            }),
            columnHelper.accessor('boat', {
                header: "Class",
                id: "Class",
                size: 300,
                cell: props => <Class {...props} clubId={clubId} options={options} />,
                enableSorting: false
            }),
            columnHelper.accessor('SailNumber', {
                header: "Sail Number",
                cell: props => <Number {...props} disabled={false} />,
                enableSorting: false
            }),
            columnHelper.display({
                id: "Edit",
                cell: props => <Edit {...props} deleteResult={deleteResult} showEditModal={showEditModal} />
            }),
        ],
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })
    return (
        <div className='block max-w-full' id={'signOnTable-' + props.raceId}>
            <table className='w-full border-spacing-0'>
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id} className='border-4 p-2' style={{ width: header.getSize() }}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    {header.column.getCanSort() ? (
                                        <div>
                                            <Sort column={header.column} table={table} />
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
                                <td key={cell.id} className='border-4 p-2 w-1'>
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

export default SignOnTable