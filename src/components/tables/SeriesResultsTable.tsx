'use client'
import React, { ChangeEvent, useState, useEffect } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, SortingState } from '@tanstack/react-table'
import * as DB from '@/components/apiMethods'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'

//not a db type, only used here
type SeriesResultsType = {
    Rank: number
    Helm: string
    Crew: string
    Boat: BoatDataType
    SailNumber: string
    Total: number
    Net: number
    racePositions: { race: number; position: number; discarded: boolean }[]
}

const Text = ({ ...props }) => {
    const value = props.getValue()

    return <div>{value}</div>
}

const Number = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)
    return <div>{Math.round(value)}</div>
}

const Result = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue.position)
    const [discarded, setDiscarded] = React.useState(initialValue.discarded)
    return <div className={discarded ? 'line-through' : ''}>{Math.round(value)}</div>
}

function Sort({ column, table }: { column: any; table: any }) {
    const firstValue = table.getPreFilteredRowModel().flatRows[0]?.getValue(column.id)

    const columnFilterValue = column.getFilterValue()

    return (
        <div className='flex flex-row justify-center'>
            <p onClick={e => column.toggleSorting(true)} className='cursor-pointer'>
                ▲
            </p>
            <p onClick={e => column.toggleSorting(false)} className='cursor-pointer'>
                ▼
            </p>
        </div>
    )
}

const columnHelper = createColumnHelper<SeriesResultsType>()

const SeriesResultsTable = ({ seriesId }: { seriesId: string }) => {
    let [seriesData, setSeriesData] = useState<SeriesDataType>()

    useEffect(() => {
        function fetchSeries() {
            DB.GetSeriesById(seriesId).then(data => {
                setSeriesData(data)
            })
        }
        fetchSeries()
    }, [seriesId])

    //calculate results table from data.
    let [data, setData] = useState<SeriesResultsType[]>([])

    const calcTable = () => {
        if (seriesData == undefined) {
            console.log('seriesData is undefined')
            return
        }
        let tempresults: SeriesResultsType[] = []
        //collate results from same person.
        seriesData.races.forEach(race => {
            race.fleets
                .flatMap(fleet => fleet.results)
                .forEach(result => {
                    //if new racer, add to tempresults
                    let index = tempresults.findIndex(function (t) {
                        return t.Helm == result.Helm && t.Boat?.id == result.boat?.id
                    })
                    if (index == -1) {
                        index = tempresults.push({
                            //sets index to index of newly pushed element
                            Rank: 0,
                            Helm: result.Helm,
                            Crew: result.Crew,
                            Boat: result.boat,
                            SailNumber: result.SailNumber,
                            Total: 0,
                            Net: 0,
                            racePositions: Array(seriesData.races.length).fill({ position: 0, discarded: false })
                        })
                        index -= 1
                    }
                    //add result to tempresults
                    if (tempresults[index]) {
                        tempresults[index]!.racePositions.splice(race.number - 1, 1, { race: race.number, position: result.HandicapPosition, discarded: false })
                    } else {
                        console.log('something went wrong')
                    }
                })
        })

        //give duty team their average score if they have raced in the series
        seriesData.races.forEach(race => {
            //loop through duty team on each race.
            Object.entries(race.Duties).map(([displayName, name]) => {
                let index = tempresults.findIndex(function (t) {
                    return t.Helm == (name as unknown as string) //cast to unknown to avoid type error
                })
                if (index != -1) {
                    //get average score
                    let total = 0
                    let count = 0
                    tempresults[index]!.racePositions.forEach((position, i) => {
                        if (position.position != 0) {
                            total += position.position
                            count++
                        }
                    })
                    let average = total / count
                    tempresults[index]!.racePositions.splice(race.number - 1, 1, { race: race.number, position: average, discarded: false })
                }
            })
        })

        //fill dnc
        tempresults.forEach((result, i) => {
            result.racePositions.forEach((position, j) => {
                if (position.position == 0) {
                    //set to number of series entrants + 1
                    tempresults[i]!.racePositions[j] = { race: j, position: tempresults.length + 1, discarded: false }
                }
            })
        })
        //calculate total
        tempresults.forEach(result => {
            result.Total = result.racePositions.reduce((partialSum, a) => partialSum + a.position, 0)
        })
        //calculate discards/net
        tempresults.forEach(result => {
            let sortedResult = JSON.parse(JSON.stringify(result)) as SeriesResultsType
            sortedResult.racePositions.sort((a, b) => a.position - b.position)
            let Net = 0
            let modifiedResult = sortedResult.racePositions.map((position, index) => {
                if (index < seriesData.settings.numberToCount) {
                    Net += position.position
                    return { ...position, discarded: false } // Ensure discarded is false for counted positions
                } else {
                    return { ...position, discarded: true } // Mark position as discarded
                }
            })
            result.Net = Net
            //sort race positions by race number
            result.racePositions = modifiedResult
            result.racePositions.sort((a, b) => a.race - b.race)
        })
        console.log(tempresults)

        //sort results by Net, split results if necessary
        tempresults.sort((a: SeriesResultsType, b: SeriesResultsType) => {
            if (a.Net < b.Net) {
                return -1
            } else if (a.Net > b.Net) {
                return 1
            } else {
                //two results with same Net Score.
                //loop through positions.
                let result = 0
                for (let i = 1; i < 1000; i++) {
                    //calculate number of positions.
                    let aNumber = a.racePositions.reduce((partialSum: number, position: { position: number; discarded: boolean }) => {
                        if (position.position == i) {
                            return partialSum + 1
                        } else {
                            return partialSum
                        }
                    }, 0)
                    let bNumber = b.racePositions.reduce((partialSum: number, position: { position: number; discarded: boolean }) => {
                        if (position.position == i) {
                            return partialSum + 1
                        } else {
                            return partialSum
                        }
                    }, 0)
                    if (aNumber < bNumber) {
                        result = 1
                        break
                    } else if (aNumber > bNumber) {
                        result = -1
                        break
                    }
                }

                return result
            }
        })

        //set rank value.
        tempresults.forEach((result, index) => {
            result.Rank = index + 1
        })

        setData(tempresults)
    }

    useEffect(() => {
        if (seriesData != undefined) {
            calcTable()
            generateColumns()
        }
    }, [seriesData])

    const [columns, setColumns] = useState([
        columnHelper.accessor('Rank', {
            header: 'Rank',
            cell: props => <Number {...props} />,
            enableSorting: true
        }),
        columnHelper.accessor('Helm', {
            header: 'Helm',
            size: 300,
            cell: props => <Text {...props} />,
            enableSorting: false
        }),
        columnHelper.accessor('Crew', {
            header: 'Crew',
            size: 300,
            cell: props => <Text {...props} />,
            enableSorting: false
        }),
        columnHelper.accessor(data => data.Boat?.name, {
            header: 'Class',
            size: 300,
            id: 'Class',
            cell: props => <Text {...props} />,
            enableSorting: false
        }),
        columnHelper.accessor(data => data.SailNumber, {
            header: 'Sail Number',
            cell: props => <Text {...props} />,
            enableSorting: false
        })
    ])

    const generateColumns = () => {
        if (seriesData == undefined) {
            console.log('seriesData is undefined')
            return
        }

        seriesData.races.sort((a, b) => a.number - b.number)
        var newColumns: any[] = []
        //add column for each race in series
        seriesData.races.forEach((race: RaceDataType, index: number) => {
            const newColumn = columnHelper.accessor(data => data.racePositions[index], {
                id: 'R' + race.number.toString(),
                header: 'R' + race.number.toString(),
                cell: props => <Result {...props} />,
                enableSorting: false
            })
            newColumns.push(newColumn)
        })

        setColumns([...columns.slice(0, 5), ...newColumns, ...columns.slice(6, 6)]) //insert after Helm, Crew, Class, Sail Number
        console.log('columns', columns)
    }

    const totalColumn = columnHelper.accessor('Total', {
        header: 'Total',
        cell: props => <Number {...props} />,
        enableSorting: true
    })

    const netColumn = columnHelper.accessor('Net', {
        header: 'Net',
        cell: props => <Number {...props} disabled={true} />,
        enableSorting: true
    })

    columns.push(totalColumn)
    columns.push(netColumn)

    const [sorting, setSorting] = useState<SortingState>([
        {
            id: 'Rank',
            desc: false
        }
    ])

    let table = useReactTable({
        data,
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

export default SeriesResultsTable
