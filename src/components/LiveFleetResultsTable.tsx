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
    let result = props.result
    let valueString = ""
    if (result.resultCode != "") {
        valueString = result.resultCode
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

const calculateHandicapResults = (fleet: FleetDataType) => {
    //most nuber of laps.
    const maxLaps = Math.max.apply(null, fleet.results.map(function (o: ResultsDataType) { return o.laps.length }))

    //calculate corrected time
    fleet.results.forEach(result => {
        //don't know why types aren't quite working here
        if (result.laps.length == 0) { return }
        let seconds = result.laps[result.laps.length - 1]!.time - fleet.startTime
        result.CorrectedTime = (seconds * 1000 * (maxLaps / result.laps.length)) / result.boat.py
        console.log(result.CorrectedTime)
    });

    //calculate finish position

    //sort by corrected time, if corrected time is 0 move to end, and rtd to end
    fleet.results.sort((a, b) => {
        if (a.resultCode != "") {
            return 1
        }
        if (b.resultCode != "") {
            return -1
        }
        if (a.CorrectedTime == 0) {
            return 1
        }
        if (b.CorrectedTime == 0) {
            return 1
        }
        if (a.CorrectedTime > b.CorrectedTime) {
            return 1
        }
        if (a.CorrectedTime < b.CorrectedTime) {
            return -1
        }
        return 0
    })

    fleet.results.forEach((result, index) => {
        result.HandicapPosition = index + 1
    })
    return fleet
}


const calculatePursuitResults = (fleet: FleetDataType) => {
    return fleet
}


const columnHelper = createColumnHelper<ResultsDataType>()


const LiveResultsTable = (props: any) => {
    let [fleet, setFleet] = useState<FleetDataType>(props.fleet)
    let [startTime, setStartTime] = useState<number>(props.startTime)
    console.log(props.handicap)
    let [handicap, setHandicap] = useState<boolean>(props.handicap == "Handicap" ? true : false)

    let [results, setResults] = useState<ResultsDataType[]>(props.handicap == "Handicap" ? calculateHandicapResults(fleet).results : calculatePursuitResults(fleet).results)
    let maxLaps = 0
    results.forEach((result, index) => {
        if (result.laps.length > maxLaps) {
            maxLaps = result.laps.length
        }
    })

    console.log(results)

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
        columnHelper.accessor((data) => data.laps.length, {
            header: "Laps",
            cell: props => <Number {...props} />,
            enableSorting: false,
        })
    ];

    // add column for each lap
    for (let i = 0; i < maxLaps; i++) {
        const newColumn = columnHelper.accessor((data) => data.laps[i]?.time, {
            header: "LAP " + (i + 1).toString(),
            cell: props => <Time {...props} disabled={true} startTime={startTime} />,
            enableSorting: false
        })
        columns.push(newColumn)
    }

    const Correctedtime = columnHelper.accessor('CorrectedTime', {
        header: "Corrected Time",
        cell: props => <CorrectedTime {...props} result={results.find(result => result.id == props.row.original.id)} />,
        enableSorting: false
    })

    //results are ordered by corrected time so the index is the position
    const Position = columnHelper.accessor((data) => handicap ? data.HandicapPosition : data.PursuitPosition, {
        header: "Position",
        cell: props => <Number {...props} />,
        enableSorting: true
    })

    columns.push(Correctedtime)
    columns.push(Position)

    let table = useReactTable({
        data: results,
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