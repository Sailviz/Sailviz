'use client'
import React, { ChangeEvent, useState } from 'react';
import dayjs from 'dayjs';
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, RowSelection, SortingState, useReactTable } from '@tanstack/react-table'
import * as DB from 'components/apiMethods';
import Select, { CSSObjectWithLabel } from 'react-select';
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Dropdown, DropdownItem, DropdownTrigger, Button, DropdownMenu, Input, Tooltip, Spinner } from '@nextui-org/react';
import { VerticalDotsIcon } from 'components/icons/vertical-dots-icon';
import { EyeIcon } from 'components/icons/eye-icon';
import { EditIcon } from 'components/icons/edit-icon';
import { DeleteIcon } from 'components/icons/delete-icon';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import useSWR from 'swr';
import * as Fetcher from 'components/Fetchers';


const raceOptions = [{ value: "Pursuit", label: "Pursuit" }, { value: "Handicap", label: "Handicap" }]

const Time = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)

    const onBlur = () => {
        console.log(value)
        var raceData: RaceDataType = props.row.original
        console.log(raceData.id)
        var time = value.replace('T', ' ')
        var day = dayjs(time)
        if (day.isValid()) {
            raceData.Time = time
            DB.updateRaceById(raceData)
        }
    }

    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])
    return (
        <>
            <Input
                type="datetime-local"
                id='Time'
                className="w-full"
                value={dayjs(value).format('YYYY-MM-DDTHH:mm')}
                onChange={e => setValue(e.target.value)}
                onBlur={onBlur}
            />
        </>
    );
};

const Type = ({ ...props }: any) => {
    const { theme, setTheme } = useTheme()
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)

    const onBlur = (type: string) => {
        var raceData: RaceDataType = props.row.original
        console.log(raceData.id)

        raceData.Type = type
        DB.updateRaceById(raceData)
    }

    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])
    return (
        <>
            <Select
                defaultValue={{ value: value, label: value }}
                key={value}
                onChange={(e) => { setValue(e?.value); onBlur(e?.value) }}
                className='w-full'
                options={raceOptions}

                styles={{
                    control: (provided, state) => ({
                        ...provided,
                        border: 'none',
                        padding: '0.5rem',
                        fontSize: '1rem',
                        borderRadius: '0.5rem',
                        color: 'white',
                        backgroundColor: theme == 'dark' ? '#27272a' : '#f4f4f5',
                        '&:hover': {
                            backgroundColor: theme == 'dark' ? '#3f3f46' : '#e4e4e7',
                        },
                    } as CSSObjectWithLabel),
                    option: (provided, state) => ({
                        ...provided,
                        color: theme == 'dark' ? 'white' : 'black',
                        backgroundColor: theme == 'dark' ? state.isSelected ? '#27272a' : '#18181b' : state.isSelected ? '#f4f4f5' : 'white',
                        '&:hover': {
                            backgroundColor: theme == 'dark' ? '#3f3f46' : '#d4d4d8',
                        },
                    } as CSSObjectWithLabel),
                    menu: (provided, state) => ({
                        ...provided,
                        backgroundColor: theme == 'dark' ? '#18181b' : 'white',
                        border: theme == 'dark' ? '2px solid #3f3f46' : '2px solid #d4d4d8',
                    } as CSSObjectWithLabel),
                    singleValue: (provided, state) => ({
                        ...provided,
                        color: theme == 'dark' ? 'white' : 'black',
                    } as CSSObjectWithLabel),
                }}
            />
        </>
    );
};



const Action = ({ ...props }: any) => {
    const Router = useRouter()

    const onDeleteClick = () => {
        if (confirm("are you sure you want to do this?")) {
            props.removeRace(props.id)
        }
    }
    return (
        <div className="relative flex items-center gap-2">
            <Tooltip content="View" >
                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                    <EyeIcon onClick={() => Router.push('/Race/' + props.row.original.id)} />
                </span>
            </Tooltip>
            <Tooltip content="Edit">
                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                    <EditIcon />
                </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete" >
                <span className="text-lg text-danger cursor-pointer active:opacity-50">
                    <DeleteIcon onClick={onDeleteClick} />
                </span>
            </Tooltip>
        </div>
    );
};


const columnHelper = createColumnHelper<RaceDataType>()

const SeriesRaceTable = (props: any) => {
    const [seriesId, setSeriesId] = useState(props.id)
    const { data: series, error: seriesIsError, isValidating: seriesIsValidating } = useSWR(`/api/GetSeriesById?id=${seriesId}`, Fetcher.fetcher, { keepPreviousData: true, suspense: true })


    let data = series.races
    if (data == undefined) {
        data = []
    }

    const loadingState = seriesIsValidating || data?.length === 0 ? "loading" : "idle";

    const [sorting, setSorting] = useState<SortingState>([{
        id: "number",
        desc: false,
    }]);

    const updateData = (data: any) => {
        props.removeRace(data)
    }

    const goToRace = (data: any) => {
        props.goToRace(data)
    }

    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('number', {
                id: "number",
                cell: info => info.getValue(),
                enableSorting: true
            }),
            columnHelper.accessor('Time', {
                id: "Number of Races",
                cell: props => <Time {...props} />
            }),
            columnHelper.accessor('Type', {
                id: "Type",
                cell: props => <Type {...props} />
            }),
            columnHelper.accessor('id', {
                id: "action",
                header: "Actions",
                cell: props => <Action {...props} id={props.row.original.id} removeRace={updateData} />
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
                <TableBody
                    emptyContent={"No races yet."}
                    loadingContent={<Spinner />}
                    loadingState={loadingState}>
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

export default SeriesRaceTable