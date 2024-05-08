import React, { ChangeEvent, MouseEventHandler, useState } from 'react';
import dayjs from 'dayjs';
import { createColumnHelper, flexRender, getCoreRowModel, RowSelection, useReactTable } from '@tanstack/react-table'
import * as DB from './apiMethods';
import Select from 'react-select';


const raceOptions = [{ value: "Pursuit", label: "Pursuit" }, { value: "Handicap", label: "Handicap" }]

const Time = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)

    const onBlur = () => {
        console.log(value)
        var raceData: RaceDataType = props.row.original
        console.log(raceData.id)
        var time = value.replace('T', ' ')
        var day = dayjs(time)
        if (day.isValid()) {
            raceData.Time = time
            DB.updateRaceById(raceData)
        }
    }

    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])
    return (
        <>
            <input type="datetime-local"
                id='Time'
                className="w-full"
                value={dayjs(value).format('YYYY-MM-DDTHH:ss')}
                onChange={e => setValue(e.target.value)}
                onBlur={onBlur}
            />
        </>
    );
};

const Type = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)

    const onBlur = (type: string) => {
        var raceData: RaceDataType = props.row.original
        console.log(raceData.id)

        raceData.Type = type
        DB.updateRaceById(raceData)
    }

    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])
    return (
        <>
            <Select
                defaultValue={{ value: value, label: value }}
                key={value}
                onChange={(e) => { setValue(e?.value); onBlur(e?.value) }}
                className='w-full'
                options={raceOptions} />
        </>
    );
};

const Text = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)

    const onBlur = (e: ChangeEvent<HTMLInputElement>) => {
        var raceData: RaceDataType = props.row.original
        // use props.column.id to update the correct field
        switch (props.column.id) {
            case "OOD":
                raceData.OOD = e.target.value
                break;
            case "AOD":
                raceData.AOD = e.target.value
                break;
            case "SO":
                raceData.SO = e.target.value
                break;
            case "ASO":
                raceData.ASO = e.target.value
                break;
            case "Time":
                raceData.Time = e.target.value
                break;
            case "Type":
                raceData.Type = e.target.value
                break;
        }

        DB.updateRaceById(raceData)
    }

    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])
    return (
        <>
            <input type="text"
                id=''
                className="w-32 p-2 "
                defaultValue={value}
                key={value}
                onBlur={(e) => onBlur(e)}
            />
        </>
    );
};

const Remove = ({ ...props }: any) => {
    const onClick = () => {
        props.removeRace(props.id)
    }
    return (
        <p className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0"
            onClick={onClick} >
            Remove
        </p>
    );

};

const GoTo = ({ ...props }: any) => {
    const onClick = () => {
        props.goToRace(props.id)
    }
    return (
        <p className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0"
            onClick={onClick} >
            GoTo
        </p>
    );

};

const columnHelper = createColumnHelper<RaceDataType>()


const SeriesTable = (props: any) => {
    var [data, setData] = useState(props.data)

    const updateData = (data: any) => {
        console.log(data)
        setData(data)
        props.removeRace(data)
    }

    const goToRace = (data: any) => {
        props.goToRace(data)
    }

    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('number', {
                id: "number",
                cell: info => info.getValue(),
            }),
            columnHelper.accessor('Time', {
                id: "Number of Races",
                cell: props => <Time {...props} />
            }),
            columnHelper.accessor('Type', {
                id: "Type",
                cell: props => <Type {...props} />
            }),
            columnHelper.accessor('OOD', {
                id: "OOD",
                cell: props => <Text {...props} />
            }),
            columnHelper.accessor('AOD', {
                id: "AOD",
                cell: props => <Text {...props} />
            }),
            columnHelper.accessor('SO', {
                id: "SO",
                cell: props => <Text {...props} />
            }),
            columnHelper.accessor('ASO', {
                id: "ASO",
                cell: props => <Text {...props} />
            }),
            columnHelper.accessor('id', {
                id: "Remove",
                cell: props => <Remove {...props} id={props.row.original.id} removeRace={updateData} />
            }),
            columnHelper.accessor('id', {
                id: "GoTo",
                cell: props => <GoTo {...props} id={props.row.original.id} goToRace={goToRace} />
            }),
        ],
        getCoreRowModel: getCoreRowModel(),
    })
    return (
        <div key={props.data}>
            <table>
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id} className='border-4 p-1'>
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
                                <td key={cell.id} className='border-4 p-2'>
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

export default SeriesTable