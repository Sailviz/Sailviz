import React, { useState, useEffect } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, SortingState, sortingFns, SortingFn, Row } from '@tanstack/react-table'
import * as Fetcher from '@/components/Fetchers'
import { ChevronDownIcon } from '@/components/icons/chevron-down-icon'
import { ChevronUpIcon } from '@/components/icons/chevron-up-icon'
import { SmoothSpinner } from '@/components/icons/smooth-spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

enum raceStateType {
    running,
    stopped,
    reset,
    calculate,
    retire
}

// these options are specific to each fleet
enum raceModeType {
    Lap,
    Finish,
    None
}

const Text = ({ text }: { text: string }) => {
    return <div>{text}</div>
}

const StartTime = ({ seconds }: { seconds: number }) => {
    //display the start time in mm:ss format
    return <div>{new Date(seconds * 1000).toISOString().substr(14, 5)}</div>
}

const Position = ({ text, result }: { text: string; result: ResultDataType }) => {
    if (result.resultCode != '') {
        text = result.resultCode
    }
    return <div>{text}</div>
}

const Laps = ({ laps }: { laps: LapDataType[] }) => {
    return <div>{laps.length}</div>
}

const Class = ({ boat }: { boat: BoatDataType }) => {
    return <div>{boat.name}</div>
}

const Sort = ({ result, max, moveUp, moveDown }: { result: ResultDataType; max: number; moveUp: (id: string) => Promise<void>; moveDown: (id: string) => Promise<void> }) => {
    const [upLoading, setUpLoading] = useState(false)
    const [downLoading, setDownLoading] = useState(false)
    return (
        <>
            <Button
                className='mx-1 stroke-green-400 stroke-2 disabled:stroke-0'
                onClick={async () => {
                    setUpLoading(true)
                    await moveUp(result.id)
                }}
                disabled={result.PursuitPosition == 1 || result.resultCode != ''}
            >
                {upLoading ? <SmoothSpinner /> : <ChevronUpIcon transform='scale(-2)' />}
            </Button>
            <Button
                size='lg'
                className='mx-1 stroke-red-400 stroke-2 disabled:stroke-0'
                onClick={async () => {
                    setDownLoading(true)
                    await moveDown(result.id)
                }}
                disabled={result.PursuitPosition == max || result.resultCode != ''}
            >
                {downLoading ? <SmoothSpinner /> : <ChevronDownIcon transform='scale(2)' />}
            </Button>
        </>
    )
}

const Action = ({ raceState, result, showRetireModal }: { raceState: raceStateType; result: ResultDataType; showRetireModal: (id: string) => void }) => {
    if (raceState == raceStateType.retire) {
        return (
            <Button color='danger' onClick={() => showRetireModal(result.id)} disabled={result.resultCode != ''}>
                Retire
            </Button>
        )
    } else {
        return <>-</>
    }
}

const columnHelper = createColumnHelper<ResultDataType>()

const PursuitTable = ({
    fleetId,
    raceState,
    showRetireModal,
    moveUp,
    moveDown
}: {
    fleetId: string
    raceState: raceStateType
    showRetireModal: (id: string) => void
    moveUp: (id: string) => Promise<void>
    moveDown: (id: string) => Promise<void>
}) => {
    const { fleet, fleetIsValidating, fleetIsError } = Fetcher.Fleet(fleetId)
    let data = fleet.results //.filter(result => result.resultCode == '')
    if (data == undefined) {
        data = []
    }

    const [sorting, setSorting] = useState<SortingState>([
        {
            id: 'PursuitPosition',
            desc: false
        }
    ])

    let columns = [
        columnHelper.accessor('PursuitPosition', {
            header: 'Position',
            cell: props => <Position text={props.getValue().toString()} result={props.row.original} />,
            enableSorting: true
        }),
        columnHelper.display({
            header: 'Adjust Position',
            id: 'Sort',
            // max is the number of boats without a result code
            cell: props => <Sort result={props.row.original} moveUp={moveUp} moveDown={moveDown} max={data.filter(result => result.resultCode == '').length} />
        }),
        columnHelper.accessor('Helm', {
            header: 'Helm',
            cell: props => <Text text={props.getValue()} />
        }),
        columnHelper.accessor('Crew', {
            header: 'Crew',
            cell: props => <Text text={props.getValue()} />
        }),
        columnHelper.accessor('boat', {
            header: 'Class',
            id: 'Class',
            size: 300,
            cell: result => <Class boat={result.getValue()} />
        }),
        columnHelper.accessor('SailNumber', {
            header: 'Sail Number',
            cell: props => <Text text={props.getValue()} />
        }),
        columnHelper.accessor(result => (result.laps.slice(-1)[0]?.time || 0) - fleet.startTime, {
            header: 'Last Lap',
            id: 'lastLap',
            cell: props => <StartTime seconds={props.getValue()} />
        }),
        columnHelper.accessor('laps', {
            header: 'Laps',
            cell: props => <Laps laps={props.getValue()} />
        }),
        columnHelper.accessor(result => result, {
            header: 'Action',
            cell: props => <Action raceState={raceState} showRetireModal={showRetireModal} result={props.getValue()} />
        })
    ]
    const loadingState = fleetIsValidating || data?.length === 0 ? 'loading' : 'idle'

    let table = useReactTable({
        data,
        columns: columns,
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

export default PursuitTable
