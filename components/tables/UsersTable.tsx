import React, { ChangeEvent, useState } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, RowSelection, SortingState, useReactTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Dropdown, DropdownItem, DropdownTrigger, Button, DropdownMenu } from '@nextui-org/react';
import { VerticalDotsIcon } from 'components/icons/vertical-dots-icon';


const Edit = ({ ...props }: any) => {
    const onClick = () => {
        props.edit(props.id)
    }
    return (
        <p className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0"
            onClick={onClick} >
            Edit
        </p>
    );

};

const columnHelper = createColumnHelper<UserDataType>()

const UsersTable = (props: any) => {
    var [data, setData] = useState(props.data)

    const [sorting, setSorting] = useState<SortingState>([{
        id: "number",
        desc: false,
    }]);

    const edit = (data: any) => {
        props.edit(data)
    }

    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('displayName', {
                id: "number",
                cell: info => info.getValue(),
                enableSorting: true
            }),
            columnHelper.accessor('id', {
                id: "Edit",
                header: "Edit",
                cell: props => <Edit {...props} id={props.row.original.id} edit={edit} />
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
        <div key={props.data}>
            <Table isStriped id={"clubTable"}>
                <TableHeader>
                    {table.getHeaderGroups().flatMap(headerGroup => headerGroup.headers).map(header => {
                        return (
                            <TableColumn key={header.id}>
                                {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                )}
                            </TableColumn>
                        );
                    })}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows.map(row => (
                        <TableRow key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <TableCell key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}

                </TableBody>
            </Table>
        </div>
    )
}

export default UsersTable