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

const Empty = ({ ...props }) => {
    return (
        <div />
    );
};

function Sort({ column, table }: { column: any, table: any }) {
    const firstValue = table
        .getPreFilteredRowModel()
        .flatRows[0]?.getValue(column.id);

    const columnFilterValue = column.getFilterValue();

    return (
        <></>
    )
}


const columnHelper = createColumnHelper<ResultsDataType>()


const PaperResultsTable = (props: any) => {
    let [results, setResults] = useState<ResultsDataType[]>(props.results)


    //sets sorting to position by default
    const [sorting, setSorting] = useState<SortingState>([{
        id: "PY",
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
            cell: props => <Text {...props} />,
            enableSorting: false
        }),
    ];

    // add column for each lap
    for (let i = 0; i < 6; i++) {
        const newColumn = columnHelper.accessor((data) => data.laps[i]?.time, {
            header: "LAP " + (i + 1).toString(),
            cell: props => <Empty {...props} />,
            enableSorting: false
        })
        columns.push(newColumn)
    }

    const ElapsedTime = columnHelper.accessor('id', {
        header: "Elapsed Time",
        cell: props => <Empty {...props} />,
        enableSorting: false
    })
    columns.push(ElapsedTime)

    const Seconds = columnHelper.accessor('id', {
        header: "Seconds",
        cell: props => <Empty {...props} />,
        enableSorting: false
    })
    columns.push(Seconds)

    const PY = columnHelper.accessor((data) => data.boat?.py || 0, {
        header: "PY",
        cell: props => <Text {...props} />,
        enableSorting: true
    })
    columns.push(PY)

    const Correctedtime = columnHelper.accessor('id', {
        header: "Corrected Time",
        cell: props => <Empty {...props} />,
        enableSorting: false
    })
    columns.push(Correctedtime)

    const Position = columnHelper.accessor('id', {
        header: "Position",
        cell: props => <Empty {...props} />,
        enableSorting: false
    })
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
                                <th key={header.id} className='border-4 p-2 text-sm' style={{ width: header.getSize() }}>
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
                                <td key={cell.id} className='border-4 p-2 w-1 text-xs'>
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

export default PaperResultsTable