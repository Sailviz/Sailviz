"use client"
import React, { ChangeEvent, useState } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Dropdown, DropdownItem, DropdownTrigger, Button, DropdownMenu } from '@nextui-org/react';
import { VerticalDotsIcon } from 'components/icons/vertical-dots-icon';



const Action = ({ ...props }: any) => {
    const onClick = () => {
        if (confirm("are you sure you want to do this?")) {
            props.deleteSeries(props.row.original)
        }
    }
    return (
        <div className="relative flex justify-end items-center gap-2">
            <Dropdown>
                <DropdownTrigger>
                    <Button isIconOnly size="sm" variant="light">
                        <VerticalDotsIcon />
                    </Button>
                </DropdownTrigger>
                <DropdownMenu>
                    <DropdownItem onClick={() => props.viewSeries(props.row.original.id)}>View</DropdownItem>
                    <DropdownItem>Edit</DropdownItem>
                    <DropdownItem>Delete</DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </div>
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

    const viewSeries = (seriesId: string) => {
        props.viewSeries(seriesId)
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
                cell: info => info.getValue(),
            }),
            columnHelper.accessor(row => row.races.length.toString(), {
                id: "Number of Races",
                cell: info => info.getValue(),
            }),
            columnHelper.accessor(row => row.settings['numberToCount'], {
                id: "Number to Count",
                cell: info => info.getValue(),
            }),
            columnHelper.accessor('id', {
                id: "Remove",
                header: "Action",
                cell: props => <Action {...props} id={props.row.original.id} deleteSeries={deleteSeries} viewSeries={viewSeries} />
            }),
        ],
        getCoreRowModel: getCoreRowModel(),
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

export default ClubTable