import React, { ChangeEvent, useState, useEffect } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import Select from 'react-select';
import * as DB from '../components/apiMethods';

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

    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])
    return (
        <>
            <input type="number"
                id=''
                className="p-2 m-2 text-center w-full"
                defaultValue={Math.round(value)}
                key={value}
                onBlur={(e) => onBlur(e)}
            />
        </>
    );
};

const Time = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)

    const onBlur = (e: ChangeEvent<HTMLInputElement>) => {
        let original = props.row.original
        console.log(e.target.value)
        original[props.column.id] = e.target.value
        props.updateResult(original)
    }

    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])
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
    );
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


const columnHelper = createColumnHelper<ResultsDataType>()

const RaceResultsTable = (props: any) => {
    let [data, setData] = useState<ResultsDataType[]>(props.data)
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
        setData(tempdata)
        calculateResults()
    }

    const calculateResults = () => {
        //most nuber of laps.
        const maxLaps = Math.max.apply(null, data.map(function (o: ResultsDataType) { return o.Laps }))
        if (!(maxLaps > 0)) {
            console.log("max laps not more than one")
            return
        }
        const resultsData = [...data]

        //calculate corrected time
        resultsData.forEach(result => {
            if (result.Time == "" || result.boat == null || result.Laps == 0)
                return
            const timeParts: string[] = result.Time.split(':');
            let seconds = 1
            if (timeParts[0] != undefined && timeParts[1] != undefined && timeParts[2] != undefined) {
                seconds = (+timeParts[0]) * 60 * 60 + (+timeParts[1]) * 60 + (+timeParts[2]);
            }
            result.CorrectedTime = (seconds * 1000 * (maxLaps / result.Laps)) / result.boat.py
        });

        //calculate finish position

        const sortedResults = resultsData.sort((a, b) => a.CorrectedTime - b.CorrectedTime);
        sortedResults.forEach((result, index) => {
            result.Position = index + 1;
        });

        sortedResults.forEach(result => {
            DB.updateResultById(result)
        })

        setData(sortedResults)
        console.log(sortedResults)
    }


    let table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('Helm', {
                header: "Helm",
                cell: props => <Text {...props} updateResult={updateResult} />
            }),
            columnHelper.accessor('Crew', {
                header: "Crew",
                cell: props => <Text {...props} updateResult={updateResult} />
            }),
            columnHelper.accessor('boat', {
                header: "Class",
                id: "Class",
                size: 300,
                cell: props => <Class {...props} updateResult={updateResult} clubId={clubId} />
            }),
            columnHelper.accessor('SailNumber', {
                header: "Sail Number",
                cell: props => <Number {...props} updateResult={updateResult} />
            }),
            columnHelper.accessor('Time', {
                header: "Time",
                cell: props => <Time {...props} updateResult={updateResult} />
            }),
            columnHelper.accessor('Laps', {
                header: "Laps",
                cell: props => <Number {...props} updateResult={updateResult} />
            }),
            columnHelper.accessor('CorrectedTime', {
                header: "Corrected Time",
                cell: props => <Number {...props} updateResult={updateResult} />
            }),
            columnHelper.accessor('Position', {
                header: "Position",
                cell: props => <Number {...props} updateResult={updateResult} />
            }),
            columnHelper.display({
                id: "Remove",
                cell: props => <Remove {...props} deleteResult={deleteResult} />
            }),
        ],
        getCoreRowModel: getCoreRowModel()
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