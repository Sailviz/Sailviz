import React, { forwardRef, useState } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, SortingState, ColumnDef } from '@tanstack/react-table'
import { data } from 'cypress/types/jquery'
import { start } from 'repl'

const Text = ({ text }: { text: string }) => {
    return <div className=' text-center'>{text}</div>
}

const Empty = () => {
    return <div />
}

const Time = ({ time, startTime }: { time: number; startTime: number }) => {
    if (time == 0 || startTime == 0) {
        return <p className='p-2 m-2 text-center w-full'></p>
    }
    const text = new Date((time - startTime) * 1000).toISOString().substring(11, 19)
    if (time == -1) {
        return <p className='p-2 m-2 text-center w-full'>Retired</p>
    } else if (time == 0) {
        return <p className='p-2 m-2 text-center w-full'>-</p>
    } else {
        return <p className='p-2 m-2 text-center w-full'> {text}</p>
    }
}

const CorrectedTime = ({ ...props }) => {
    let value = Math.round(props.getValue())
    let result = props.result
    let valueString = ''
    if (result.resultCode != '') {
        valueString = result.resultCode
    } else {
        valueString = value.toString()
    }
    if (valueString == '0') {
        valueString = ''
    }

    return <div className=' text-center'>{valueString}</div>
}

const columnHelper = createColumnHelper<ResultDataType>()

const HandicapPaperResultsTable = forwardRef((props: { fleet: FleetDataType }, ref: any) => {
    let [results, setResults] = useState<ResultDataType[]>(props.fleet.results)
    const fleet = props.fleet

    let allFinished = true
    results.forEach(data => {
        if (data.finishTime == 0 && data.resultCode == '') {
            allFinished = false
        }
    })

    if (!allFinished) {
        //create 3 empty lines on an empty sheet only
        results.push({} as ResultDataType)
        results.push({} as ResultDataType)
        results.push({} as ResultDataType)
    }

    //sets sorting to position by default
    const [sorting, setSorting] = useState<SortingState>([
        {
            id: allFinished ? 'HandicapPosition' : 'PY',
            desc: false
        }
    ])

    let columns: ColumnDef<ResultDataType, any>[] = [
        columnHelper.accessor('Helm', {
            header: 'Helm',
            cell: props => <Text text={props.getValue()} />,
            enableSorting: false
        }),
        columnHelper.accessor('Crew', {
            header: 'Crew',
            cell: props => <Text text={props.getValue()} />,
            enableSorting: false
        }),
        columnHelper.accessor(data => data.boat?.name, {
            header: 'Class',
            id: 'Class',
            cell: props => <Text text={props.getValue()} />,
            enableSorting: false
        }),
        columnHelper.accessor(data => data.SailNumber, {
            header: 'Sail Number',
            cell: props => <Text text={props.getValue()} />,
            enableSorting: false
        })
    ]

    if (!allFinished) {
        // add column for each lap
        for (let i = 0; i < 6; i++) {
            const newColumn = columnHelper.display({
                header: (i + 1).toString(),
                size: 40,
                cell: props => <Empty />,
                enableSorting: false
            })
            columns.push(newColumn)
        }
    }
    const ElapsedTime = columnHelper.accessor(data => data.finishTime, {
        header: 'Elapsed Time',
        cell: props => <Time time={props.getValue()} startTime={fleet.startTime} />,
        enableSorting: false
    })
    columns.push(ElapsedTime)

    if (!allFinished) {
        const Seconds = columnHelper.display({
            header: 'Seconds',
            cell: props => <Empty />,
            enableSorting: false
        })
        columns.push(Seconds)
    }

    const PY = columnHelper.accessor(data => data.boat?.py.toString() || '', {
        header: 'PY',
        id: 'PY',
        cell: props => <Text text={props.getValue()} />,
        enableSorting: true,
        sortingFn: (rowA, rowB, columnId) => {
            if (rowA.original.boat?.py == undefined) {
                return Number.MAX_SAFE_INTEGER
            }
            if (rowB.original.boat?.py == undefined) {
                return Number.MAX_SAFE_INTEGER
            }
            return rowA.original.boat.py - rowB.original.boat.py
        }
    })
    columns.push(PY)

    const Correctedtime = columnHelper.accessor('CorrectedTime', {
        header: 'Corrected Time',
        cell: props => <CorrectedTime {...props} result={results.find(result => result.id == props.row.original.id)} />,
        enableSorting: false
    })
    columns.push(Correctedtime)

    const Position = columnHelper.accessor('HandicapPosition', {
        header: 'Position',
        cell: props => <Text text={props.getValue() == 0 ? '' : props.getValue()?.toString() || ''} />,
        enableSorting: true
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
        <div className='block max-w-full' ref={ref}>
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
HandicapPaperResultsTable.displayName = 'HandicapPaperResultsTable'

export default HandicapPaperResultsTable
