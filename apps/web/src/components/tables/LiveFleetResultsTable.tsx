import { useState } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type SortingState } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import type { FleetType, ResultType } from '@sailviz/types'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'

const Text = ({ ...props }) => {
    const value = props.getValue()

    return <div className=' text-center'>{value}</div>
}

const Number = ({ ...props }) => {
    const value = Math.round(props.getValue())
    //round value to nearest integer

    return <div className=' text-center'>{value}</div>
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
    //round value to nearest integer

    return <div className=' text-center'>{valueString}</div>
}

const Time = ({ ...props }) => {
    const value = props.getValue()
    if (value === undefined) {
        return <div className=' text-center'>-</div>
    }
    let time = new Date((value - props.startTime) * 1000).toISOString().substring(11, 19)

    return <div className=' text-center'>{time}</div>
}

const calculateHandicapResults = (fleet: FleetType) => {
    console.log(fleet)
    if (fleet == undefined) {
        return { fleet, results: [] }
    }
    //most nuber of laps.
    const maxLaps = Math.max.apply(
        null,
        fleet.results!.map(function (o: ResultType) {
            return o.laps.length
        })
    )

    //calculate corrected time
    fleet.results!.forEach(result => {
        //don't know why types aren't quite working here
        if (result.laps.length == 0) {
            return
        }
        let seconds = result.laps[result.laps.length - 1]!.time - fleet.startTime
        result.CorrectedTime = (seconds * 1000 * (maxLaps / result.laps.length)) / result.boat.py
        console.log(result.Helm, result.laps.length, result.CorrectedTime)
    })

    //calculate finish position

    //sort by corrected time, if corrected time is 0 move to end, and rtd to end
    fleet.results!.sort((a, b) => {
        if (a.resultCode != '') {
            return 1
        }
        if (b.resultCode != '') {
            return -1
        }
        if (a.CorrectedTime == 0) {
            return 1
        }
        if (b.CorrectedTime == 0) {
            return -1
        }
        if (a.CorrectedTime > b.CorrectedTime) {
            return 1
        }
        if (a.CorrectedTime < b.CorrectedTime) {
            return -1
        }
        return 0
    })

    fleet.results!.forEach((result, index) => {
        result.HandicapPosition = index + 1
    })
    return fleet
}

const calculatePursuitResults = (fleet: FleetType) => {
    return fleet
}

const columnHelper = createColumnHelper<ResultType>()

const LiveResultsTable = ({ raceId, startTime, handicap }: { raceId: string; startTime: number; handicap: string }) => {
    const race = useQuery(orpcClient.race.find.queryOptions({ input: { raceId: raceId }, refetchInterval: 5000 })).data
    const results = handicap == 'Handicap' ? calculateHandicapResults(race?.fleets[0]!).results! : calculatePursuitResults(race?.fleets[0]!).results!
    let maxLaps = 0
    results.forEach(result => {
        if (result.laps.length > maxLaps) {
            maxLaps = result.laps.length
        }
    })

    console.log(results)

    //sets sorting to position by default
    const [sorting, setSorting] = useState<SortingState>([
        {
            id: 'Position',
            desc: false
        }
    ])

    let columns = [
        columnHelper.accessor(data => data.Helm, {
            header: 'Helm',
            cell: props => <Text {...props} />,
            enableSorting: false
        }),
        columnHelper.accessor(data => data.Crew, {
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
            cell: props => <Number {...props} />,
            enableSorting: false
        }),
        columnHelper.accessor(data => data.laps.length, {
            header: 'Laps',
            cell: props => <Number {...props} />,
            enableSorting: false
        })
    ]

    // add column for each lap
    for (let i = Math.max(maxLaps - 3, 0); i < maxLaps; i++) {
        const newColumn = columnHelper.accessor(data => data.laps[i]?.time, {
            header: 'LAP ' + (i + 1).toString(),
            cell: props => <Time {...props} disabled={true} startTime={startTime} />,
            enableSorting: false
        })
        columns.push(newColumn)
    }

    const Correctedtime = columnHelper.accessor(data => data.CorrectedTime, {
        header: 'Corrected Time',
        cell: props => <CorrectedTime {...props} result={results.find(result => result.id == props.row.original.id)} />,
        enableSorting: false
    })

    //results are ordered by corrected time so the index is the position
    const Position = columnHelper.accessor(data => (handicap ? data.HandicapPosition : data.PursuitPosition), {
        header: 'Position',
        cell: props => <Number {...props} />,
        enableSorting: true
    })

    columns.push(Correctedtime)
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
        <div className='w-full'>
            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => {
                                    return (
                                        <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell className='h-24 text-center'>No results.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default LiveResultsTable
