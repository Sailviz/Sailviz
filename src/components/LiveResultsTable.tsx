import React, { useState } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, SortingState } from '@tanstack/react-table'


const Text = ({ ...props }) => {
    const value = props.getValue()

    return (
        <div className=' text-center'>
            {value}
        </div>
    );
};

const Number = ({ ...props }) => {
    const value = Math.round(props.getValue())
    //round value to nearest integer

    return (
        <div className=' text-center'>
            {value}
        </div>
    );
};

const CorrectedTime = ({ ...props }) => {
    let value = Math.round(props.getValue())
    let valueString = ""
    if (value == 99999) {
        valueString = "RTD"
    } else {
        valueString = value.toString()
    }
    //round value to nearest integer

    return (
        <div className=' text-center'>
            {valueString}
        </div>
    );
};



const Time = ({ ...props }) => {
    const value = props.getValue()
    if (value === undefined) {
        return (
            <div className=' text-center'>
                -
            </div>
        )
    }
    let time = new Date((value - props.startTime) * 1000).toISOString().substring(11, 19)

    return (
        <div className=' text-center'>
            {time}
        </div>
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


const LiveResultsTable = (props: any) => {
    let [race, setRace] = useState<RaceDataType>(props.data)
    // console.log(race)

    let maxLaps = 0
    race.results.forEach((result) => {
        if (result.lapTimes.number > maxLaps) {
            maxLaps = result.lapTimes.number
        }
    })

    //sets sorting to position by default
    const [sorting, setSorting] = useState<SortingState>([{
        id: "Position",
        desc: false,
    }]);

    let columns = [
        columnHelper.accessor("Helm", {
            header: "Helm",
            cell: props => <Text {...props} />,
            enableSorting: false
        }),
        columnHelper.accessor("Crew", {
            header: "Crew",
            cell: props => <Text {...props} />,
            enableSorting: false
        }),
        columnHelper.accessor((data) => data.boat?.name, {
            header: "Class",
            id: "Class",
            cell: props => <Text {...props} />,
            enableSorting: false
        }),
        columnHelper.accessor((data) => data.SailNumber, {
            header: "Sail Number",
            cell: props => <Number {...props} />,
            enableSorting: false
        }),
        columnHelper.accessor((data) => data.lapTimes.number, {
            header: "Laps",
            cell: props => <Number {...props} />,
            enableSorting: false,
        })
    ];

    // add column for each race in series
    for (let i = 0; i < maxLaps; i++) {
        const newColumn = columnHelper.accessor((data) => data.lapTimes.times[i], {
            header: "LAP " + (i + 1).toString(),
            cell: props => <Time {...props} disabled={true} startTime={race.startTime} />,
            enableSorting: false
        })
        columns.push(newColumn)
    }

    const Correctedtime = columnHelper.accessor('CorrectedTime', {
        header: "Corrected Time",
        cell: props => <CorrectedTime {...props} />,
        enableSorting: false
    })

    const Position = columnHelper.accessor('Position', {
        header: "Position",
        cell: props => <Number {...props} />,
        enableSorting: true
    })

    columns.push(Correctedtime)
    columns.push(Position)

    let table = useReactTable({
        data: race.results,
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

export default LiveResultsTable