import React, { ChangeEvent, useState, useEffect } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, SortingState } from '@tanstack/react-table'

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
        <div className=' text-center text-lg font-medium'>
            {value}
        </div>
    );
};

const Number = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)
    return (
        <>
            <input type="number"
                id=''
                className="text-center w-full font-medium"
                defaultValue={Math.round(value)}
                key={value}
                disabled={true}
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

        //fill dnc
        //calculate total
        tempresults.forEach(result => {
            result.Total = result.racePositions.reduce((partialSum, a) => partialSum + a, 0)
        })
        //calculate discards/net
        tempresults.forEach(result => {
            let sortedResult = JSON.parse(JSON.stringify(result)) as SeriesResultsType
            sortedResult.racePositions.sort((a, b) => a - b)
            let Net = 0
            //remove 0 results
            sortedResult.racePositions = sortedResult.racePositions.filter(result => result != 0)
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
                console.log("same net score")
                //two results with same Net Score.
                //loop through positions.
                let result = 0
                for (let i = 1; i < 1000; i++) {
                    //calculate number of positions.
                    let aNumber = a.racePositions.reduce((partialSum: number, position: number) => {
                        if (position == i) {
                            console.log("found position", i)
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
                console.log(result)
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
            cell: props => <Number {...props} />,
            enableSorting: false
        }),

    ];

    seriesData.races.sort((a, b) => a.number - b.number)

    //add column for each race in series
    seriesData.races.forEach((race: RaceDataType, index: number) => {
        const newColumn = columnHelper.accessor((data) => data.racePositions[index], {
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
        <div key={props.data} className='block max-w-full'>
            <table className='w-full border-spacing-0'>
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id} className='border-4 font-extrabold' style={{ width: header.getSize() }}>
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
                                <td key={cell.id} className='border-4 w-1'>
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