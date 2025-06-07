import React, { forwardRef, useState } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, SortingState, ColumnDef } from '@tanstack/react-table'

const Text = ({ ...props }) => {
    const value = props.getValue()

    return <div className=' text-center'>{value}</div>
}

const Time = ({ ...props }) => {
    const value = props.getValue()

    if (value == 999999) {
        return <div>&nbsp;</div>
    }
    const minutes = Math.floor(value / 60)
    const seconds = value % 60

    return (
        <div className=' text-center'>
            {minutes < 10 ? `0${minutes}` : minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </div>
    )
}

const Empty = ({ ...props }) => {
    return <div />
}

const columnHelper = createColumnHelper<ResultDataType>()

const PursuitPaperResultsTable = forwardRef((props: { results: ResultDataType[] }, ref: any) => {
    let [results, setResults] = useState<ResultDataType[]>(props.results)

    //create 3 empty lines on sheet
    results.push({} as ResultDataType)
    results.push({} as ResultDataType)
    results.push({} as ResultDataType)

    //sets sorting to position by default
    const [sorting, setSorting] = useState<SortingState>([
        {
            id: 'startTime',
            desc: false
        }
    ])

    let columns: ColumnDef<ResultDataType, any>[] = [
        columnHelper.accessor('Helm', {
            header: 'Helm',
            cell: props => <Text {...props} />,
            enableSorting: false
        }),
        columnHelper.accessor('Crew', {
            header: 'Crew',
            cell: props => <Text {...props} />,
            enableSorting: false
        }),
        columnHelper.accessor(data => data.boat?.name, {
            header: 'Class',
            id: 'Class',
            cell: props => <Text {...props} />,
            enableSorting: false
        }),
        columnHelper.accessor(data => data.SailNumber, {
            header: 'Sail Number',
            cell: props => <Text {...props} />,
            enableSorting: false
        })
    ]

    const startTime = columnHelper.accessor(data => data.boat?.pursuitStartTime || 999999, {
        header: 'Start Time',
        id: 'startTime',
        cell: props => <Time {...props} />,
        enableSorting: true
    })
    columns.push(startTime)

    // add column for each lap
    for (let i = 0; i < 6; i++) {
        const newColumn = columnHelper.display({
            header: (i + 1).toString(),
            size: 40,
            cell: props => <Empty {...props} />,
            enableSorting: false
        })
        columns.push(newColumn)
    }

    const Position = columnHelper.display({
        header: 'Position',
        cell: props => <Empty {...props} />,
        enableSorting: false
    })
    columns.push(Position)

    let table = useReactTable({
        data: results,
        columns,
        state: {
            sorting
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel()
    })
    return (
        <div key={JSON.stringify(props.results)} className='block max-w-full' ref={ref}>
            <table className='w-full border-spacing-0'>
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id} className='border-2 p-2 text-sm border-black' style={{ width: header.getSize() }}>
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id} className='border-2 p-2 w-1 text-xs border-black'>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
})

//This fixes a build error
PursuitPaperResultsTable.displayName = 'PursuitPaperResultsTable'

export default PursuitPaperResultsTable
