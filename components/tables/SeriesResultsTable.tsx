import React, { ChangeEvent, useState, useEffect } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, SortingState } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Dropdown, DropdownItem, DropdownTrigger, Button, DropdownMenu } from '@nextui-org/react';
import { VerticalDotsIcon } from 'components/icons/vertical-dots-icon';

//not a db type, only used here
type SeriesResultsType = {
    Rank: number;
    Helm: string;
    Crew: string;
    Boat: BoatDataType;
    SailNumber: string;
    Total: number;
    Net: number;
    racePositions: number[];
}


const Text = ({ ...props }) => {
    const value = props.getValue()

    return (
        <div>
            {value}
        </div>
    );
};

const Number = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)
    return (
        <div>
            {Math.round(value)}
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


const columnHelper = createColumnHelper<SeriesResultsType>()


const SeriesResultsTable = (props: any) => {
    let [seriesData, setSeriesData] = useState<SeriesDataType>(props.data)

    //calculate results table from data.
    let [data, setData] = useState<SeriesResultsType[]>([])

    const calcTable = () => {
        let tempresults: SeriesResultsType[] = []
        //collate results from same person.
        seriesData.races.forEach(race => {
            race.fleets.flatMap(fleet => fleet.results).forEach(result => {
                //if new racer, add to tempresults
                let index = tempresults.findIndex(function (t) {
                    return (t.Helm == result.Helm && t.Boat?.id == result.boat?.id)
                })
                if (index == -1) {
                    index = tempresults.push({ //sets index to index of newly pushed element
                        Rank: 0,
                        Helm: result.Helm,
                        Crew: result.Crew,
                        Boat: result.boat,
                        SailNumber: result.SailNumber,
                        Total: 0,
                        Net: 0,
                        racePositions: Array(seriesData.races.length).fill(0),
                    })
                    index -= 1
                }
                //add result to tempresults
                if (tempresults[index]) {
                    tempresults[index]!.racePositions.splice(race.number - 1, 1, result.HandicapPosition)
                } else {
                    console.log("something went wrong")
                }

            })

        });

        //give duty team their average score if they have raced in the series
        seriesData.races.forEach(race => {
            //loop through duty team on each race.
            Object.entries(race.Duties).map(([displayName, name]) => {
                let index = tempresults.findIndex(function (t) {
                    return (t.Helm == name as unknown as string) //cast to unknown to avoid type error
                })
                if (index != -1) {
                    //get average score
                    let total = 0
                    let count = 0
                    tempresults[index]!.racePositions.forEach((position, i) => {
                        if (position != 0) {
                            total += position
                            count++
                        }
                    })
                    let average = total / count
                    tempresults[index]!.racePositions.splice(race.number - 1, 1, average)
                }
            })
        })

        //fill dnc
        tempresults.forEach((result, i) => {
            result.racePositions.forEach((position, j) => {
                if (position == 0) {
                    //set to number of series entrants + 1
                    tempresults[i]!.racePositions[j] = tempresults.length + 1
                }
            })
        })
        //calculate total
        tempresults.forEach(result => {
            result.Total = result.racePositions.reduce((partialSum, a) => partialSum + a, 0)
        })
        //calculate discards/net
        tempresults.forEach(result => {
            let sortedResult = JSON.parse(JSON.stringify(result)) as SeriesResultsType
            sortedResult.racePositions.sort((a, b) => a - b)
            let Net = 0
            sortedResult.racePositions.forEach((position, index) => {
                if (index < seriesData.settings.numberToCount) {
                    Net += position
                }
            })
            result.Net = Net
        })

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
                    let aNumber = a.racePositions.reduce((partialSum: number, position: number) => {
                        if (position == i) {
                            return partialSum + 1
                        } else {
                            return partialSum
                        }
                    }, 0)
                    let bNumber = b.racePositions.reduce((partialSum: number, position: number) => {
                        if (position == i) {
                            return partialSum + 1
                        }
                        else {
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
        }
    }, [seriesData])

    let columns = [
        columnHelper.accessor('Rank', {
            header: "Rank",
            cell: props => <Number {...props} />,
            enableSorting: true
        }),
        columnHelper.accessor('Helm', {
            header: "Helm",
            size: 300,
            cell: props => <Text {...props} />,
            enableSorting: false
        }),
        columnHelper.accessor("Crew", {
            header: "Crew",
            size: 300,
            cell: props => <Text {...props} />,
            enableSorting: false
        }),
        columnHelper.accessor((data) => data.Boat?.name, {
            header: "Class",
            size: 300,
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

    seriesData.races.sort((a, b) => a.number - b.number)

    //add column for each race in series
    seriesData.races.forEach((race: RaceDataType, index: number) => {
        const newColumn = columnHelper.accessor((data) => data.racePositions[index], {
            id: "R" + race.number.toString(),
            header: "R" + race.number.toString(),
            cell: props => <Number {...props} disabled={true} />,
            enableSorting: false
        })
        columns.push(newColumn)
    })

    const totalColumn = columnHelper.accessor('Total', {
        header: "Total",
        cell: props => <Number {...props} disabled={true} />,
        enableSorting: true
    })

    const netColumn = columnHelper.accessor('Net', {
        header: "Net",
        cell: props => <Number {...props} disabled={true} />,
        enableSorting: true
    })

    columns.push(totalColumn)
    columns.push(netColumn)

    const [sorting, setSorting] = useState<SortingState>([{
        id: "Rank",
        desc: false,
    }]);

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
        <div key={props.data} className="h-full">
            <Table isStriped id={"clubTable"} isHeaderSticky fullWidth className="h-full overflow-auto">
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
                <TableBody emptyContent={"No results yet."}>
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

export default SeriesResultsTable