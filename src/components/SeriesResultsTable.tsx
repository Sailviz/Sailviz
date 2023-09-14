import React, { ChangeEvent, useState, useEffect } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, SortingState } from '@tanstack/react-table'
import Select from 'react-select';
import * as DB from '../components/apiMethods';

const Text = ({ ...props }) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)

    const onBlur = (e: ChangeEvent<HTMLInputElement>) => {
        const original = props.row.original
        original[props.column.id] = e.target.value
        props.updateResult(original)
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

const Number = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)

    const onBlur = (e: ChangeEvent<HTMLInputElement>) => {
        let original = props.row.original
        original[props.column.id] = parseInt(e.target.value)
        props.updateResult(original)
    }

    return (
        <>
            <input type="number"
                id=''
                className="p-2 m-2 text-center w-full"
                defaultValue={Math.round(value)}
                key={value}
                onBlur={(e) => onBlur(e)}
                disabled={props.disabled}
            />
        </>
    );
};


const Class = ({ ...props }: any) => {
    var initialValue = props.getValue()
    if (initialValue == null) {
        initialValue = { value: "", label: "" }
    }
    const [value, setValue] = React.useState(initialValue)

    let boats: BoatDataType[] = []
    let options: any = []
    useEffect(() => {
        const fetchBoats = async () => {
            boats = await DB.getBoats(props.clubId)
            boats.forEach(boat => {
                options.push({ value: boat, label: boat.name })
            })
        }
        if (props.clubId) {
            fetchBoats()
        }
    }, [value]);


    const onBlur = (newValue: any) => {
        let original = props.row.original
        console.log(newValue)
        original.boat = newValue
        props.updateResult(original)
    }


    return (
        <>
            <Select
                className='w-max min-w-full'
                defaultValue={{ value: value.id, label: value.name }}
                key={value}
                onChange={(e) => { setValue(e?.value); onBlur(e?.value) }}
                options={options}
            />

        </>
    );
};

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


const SeriesResultsTable = (props: any) => {
    let [data, setData] = useState<ResultsDataType[]>(props.data)
    let clubId = props.clubId

    let columns = [
        columnHelper.accessor('Position', {
            header: "Rank",
            cell: props => <Number {...props} disabled={true} />,
            enableSorting: true
        }),
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
            cell: props => <Class {...props} clubId={clubId} />,
            enableSorting: false
        }),
        columnHelper.accessor('SailNumber', {
            header: "Sail Number",
            cell: props => <Number {...props} disabled={false} />,
            enableSorting: false
        }),
        columnHelper.accessor('R1', {
            header: "R1",
            cell: props => <Number {...props} disabled={true} />,
            enableSorting: true
        }),
        columnHelper.accessor('Total', {
            header: "Total",
            cell: props => <Number {...props} disabled={true} />,
            enableSorting: true
        }),
        columnHelper.accessor('Net', {
            header: "Net",
            cell: props => <Number {...props} disabled={true} />,
            enableSorting: true
        }),
    ];

    props.data.races.forEach((race: RaceDataType) => {
        console.log(race)
        const newColumn = columnHelper.accessor('Net', {
            header: race.number.toString(),
            cell: props => <Number {...props} disabled={true} />,
            enableSorting: true
        })
        columns.push(newColumn)
    })

    console.log(props.data)
    const [sorting, setSorting] = useState<SortingState>([]);

    let table = useReactTable({
        data,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    return (
        <div key={props.data} className='block max-w-full'>
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

export default SeriesResultsTable