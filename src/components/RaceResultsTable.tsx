import React, { ChangeEvent, useState, useEffect } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, SortingState } from '@tanstack/react-table'
import Select from 'react-select';
import * as DB from '../components/apiMethods';
import { start } from 'repl';

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

const Laps = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)

    const onBlur = (e: ChangeEvent<HTMLInputElement>) => {
        let original = props.row.original
        original[props.column.id].number = parseInt(e.target.value)
        props.updateResult(original)
    }

    return (
        <>
            <input type="number"
                id=''
                className="p-2 m-2 text-center w-full"
                defaultValue={Math.round(value.number)}
                key={value.number}
                onBlur={(e) => onBlur(e)}
            />
        </>
    );
};

const Time = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(new Date((initialValue - props.startTime) * 1000).toISOString().substring(11, 19))

    const onBlur = (e: ChangeEvent<HTMLInputElement>) => {
        let original = props.row.original
        var parts = e.target.value.split(':'); // split it at the colons
        if (parts[0] == undefined || parts[1] == undefined || parts[2] == undefined) return
        // minutes are 60 seconds. Hours are 60 minutes * 60 seconds.
        var seconds = (+parts[0]) * 60 * 60 + (+parts[1]) * 60 + (+parts[2]);
        original[props.column.id] = seconds + props.startTime
        props.updateResult(original)
    }
    if (initialValue == -1) {
        return (
            <p className="p-2 m-2 text-center w-full">
                Retired
            </p>
        )
    } else {
        return (
            <>
                <input type="time"
                    id=''
                    className="p-2 m-2 text-center w-full"
                    defaultValue={value}
                    key={value}
                    step={"1"}
                    onBlur={(e) => onBlur(e)}
                />
            </>
        )
    }
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

const Remove = ({ ...props }: any) => {
    const onClick = () => {
        console.log(props.row.original.id)
        props.deleteResult(props.row.original.id)
    }
    return (
        <>
            <p className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0"
                onClick={onClick} >
                Remove
            </p>
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


const RaceResultsTable = (props: any) => {
    let [data, setData] = useState<ResultsDataType[]>(props.data)
    let [startTime, setStartTime] = useState(props.startTime)
    let clubId = props.clubId
    let raceId = props.raceId

    const deleteResult = (id: any) => {
        props.deleteResult(id)
        const tempdata: ResultsDataType[] = [...data]
        tempdata.splice(tempdata.findIndex((x: ResultsDataType) => x.id === id), 1)
        setData(tempdata)
    }

    const createResult = async (id: any) => {
        var result = (await props.createResult(id))
        setData([...data, result])
    }


    const updateResult = (Result: ResultsDataType) => {
        props.updateResult(Result)
        console.log(Result)
        const tempdata = data
        tempdata[tempdata.findIndex((x: ResultsDataType) => x.id === Result.id)] = Result
        console.log(tempdata)
        setData([...tempdata])
    }

    const [sorting, setSorting] = useState<SortingState>([]);

    let table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('Helm', {
                header: "Helm",
                cell: props => <Text {...props} updateResult={updateResult} />,
                enableSorting: false
            }),
            columnHelper.accessor('Crew', {
                header: "Crew",
                cell: props => <Text {...props} updateResult={updateResult} />,
                enableSorting: false
            }),
            columnHelper.accessor('boat', {
                header: "Class",
                id: "Class",
                size: 300,
                cell: props => <Class {...props} updateResult={updateResult} clubId={clubId} />,
                enableSorting: false
            }),
            columnHelper.accessor('SailNumber', {
                header: "Sail Number",
                cell: props => <Number {...props} updateResult={updateResult} disabled={false} />,
                enableSorting: false
            }),
            columnHelper.accessor('finishTime', {
                header: "Time",
                cell: props => <Time {...props} startTime={startTime} updateResult={updateResult} />,
                enableSorting: false
            }),
            columnHelper.accessor('lapTimes', {
                header: "Laps",
                cell: props => <Laps {...props} updateResult={updateResult} />,
                enableSorting: false
            }),
            columnHelper.accessor('CorrectedTime', {
                header: "Corrected Time",
                cell: props => <Number {...props} updateResult={updateResult} disabled={true} />,
                enableSorting: false
            }),
            columnHelper.accessor('Position', {
                header: "Position",
                cell: props => <Number {...props} updateResult={updateResult} disabled={true} />,
                enableSorting: true
            }),
            columnHelper.display({
                id: "Remove",
                cell: props => <Remove {...props} deleteResult={deleteResult} />
            }),
        ],
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
            <div className="p-6 w-3/4">
                <p onClick={() => createResult(raceId)} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0">
                    Add Entry
                </p>
            </div>
        </div>
    )
}

export default RaceResultsTable