'use client'
import React, { ChangeEvent, useState } from 'react';
import dayjs from 'dayjs';
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, RowSelection, SortingState, useReactTable } from '@tanstack/react-table'
import * as DB from 'components/apiMethods';
import Select, { CSSObjectWithLabel } from 'react-select';
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Dropdown, DropdownItem, DropdownTrigger, Button, DropdownMenu, Input, Tooltip } from '@nextui-org/react';
import { VerticalDotsIcon } from 'components/icons/vertical-dots-icon';
import { EyeIcon } from 'components/icons/eye-icon';
import { EditIcon } from 'components/icons/edit-icon';
import { DeleteIcon } from 'components/icons/delete-icon';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import * as Fetcher from 'components/Fetchers';
import { PageSkeleton } from 'components/ui/PageSkeleton';


const Time = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)

    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])
    return (
        <>
            <div>
                {"Today at " + dayjs(value).format(' h:mm A')}
            </div>

        </>
    );
};

const Action = ({ ...props }: any) => {
    const Router = useRouter()

    return (
        <Button color="primary" size="md" onClick={() => Router.push('/Race/' + props.row.original.id)}>
            View
        </Button>
    );
};


const columnHelper = createColumnHelper<NextRaceDataType>()

const UpcomingRacesTable = (props: any) => {
    const [club, setClub] = useState(props.club)

    const { todaysRaces, todaysRacesIsError, todaysRacesIsValidating } = Fetcher.GetTodaysRaceByClubId(club)
    const { theme, setTheme } = useTheme()
    const [sorting, setSorting] = useState<SortingState>([{
        id: "number",
        desc: false,
    }]);
    var data = todaysRaces
    console.log(data)
    if (todaysRacesIsValidating) {
        data = []
    }
    console.log(data)
    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor((data) => data.series.name, {
                header: "Series",
                cell: info => info.getValue().toString(),
                enableSorting: true
            }),
            columnHelper.accessor('number', {
                cell: info => info.getValue().toString(),
                enableSorting: true
            }),
            columnHelper.accessor('Time', {
                cell: props => <Time {...props} />
            }),
            columnHelper.accessor('id', {
                id: "action",
                header: "Actions",
                cell: props => <Action {...props} id={props.row.original.id} />
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
        <div key={props.club.id}>
            <Table id={"seriesTable"}>
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
                <TableBody emptyContent={"No races Today."}>
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

export default UpcomingRacesTable