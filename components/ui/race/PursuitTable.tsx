import React, { useState, useEffect } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, SortingState, sortingFns, SortingFn, Row } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Dropdown, DropdownItem, DropdownTrigger, Button, DropdownMenu, Spinner } from '@nextui-org/react'
import * as Fetcher from 'components/Fetchers'
import { ChevronDownIcon } from 'components/icons/chevron-down-icon'
import { ChevronUpIcon } from 'components/icons/chevron-up-icon'
import { SmoothSpinner } from 'components/icons/smooth-spinner'

enum raceStateType {
    running,
    stopped,
    reset,
    calculate
}

enum modeType {
    Retire,
    Lap,
    NotStarted,
    Finish
}

const Text = ({ text }: { text: string }) => {
    return <div>{text}</div>
}

const StartTime = ({ seconds }: { seconds: number }) => {
    //display the start time in mm:ss format
    return <div>{new Date(seconds * 1000).toISOString().substr(14, 5)}</div>
}

const Position = ({ text, result }: { text: string; result: ResultsDataType }) => {
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

const Sort = ({ result, max, moveUp, moveDown }: { result: ResultsDataType; max: number; moveUp: (id: string) => Promise<void>; moveDown: (id: string) => Promise<void> }) => {
    const [upLoading, setUpLoading] = useState(false)
    const [downLoading, setDownLoading] = useState(false)
    return (
        <>
            <Button
                variant='bordered'
                size='lg'
                className='mx-1 stroke-green-400 stroke-2 disabled:stroke-0'
                onClick={async () => {
                    setUpLoading(true)
                    await moveUp(result.id)
                }}
                isDisabled={result.PursuitPosition == 1}
            >
                {upLoading ? <SmoothSpinner /> : <ChevronUpIcon transform='scale(-2)' />}
            </Button>
            <Button
                variant='bordered'
                size='lg'
                className='mx-1 stroke-red-400 stroke-2 disabled:stroke-0'
                onClick={async () => {
                    setDownLoading(true)
                    await moveDown(result.id)
                }}
                isDisabled={result.PursuitPosition == max}
            >
                {downLoading ? <SmoothSpinner /> : <ChevronDownIcon transform='scale(2)' />}
            </Button>
        </>
    )
}

const Action = ({
    raceMode,
    resultId,
    lapBoat,
    showRetireModal
}: {
    raceMode: modeType
    resultId: string
    lapBoat: (id: string) => void
    showRetireModal: (id: string) => void
}) => {
    if (raceMode == modeType.Retire) {
        return (
            <Button color='danger' variant='ghost' onClick={() => showRetireModal(resultId)}>
                Retire
            </Button>
        )
    } else {
        return <>-</>
    }
}

const columnHelper = createColumnHelper<ResultsDataType>()

const PursuitTable = ({
    fleetId,
    raceState,
    raceMode,
    lapBoat,
    showRetireModal,
    moveUp,
    moveDown
}: {
    fleetId: string
    raceState: raceStateType
    raceMode: modeType
    lapBoat: (id: string) => void
    showRetireModal: (id: string) => void
    moveUp: (id: string) => Promise<void>
    moveDown: (id: string) => Promise<void>
}) => {
    const { fleet, fleetIsValidating, fleetIsError } = Fetcher.Fleet(fleetId)
    let data = fleet?.results
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
            cell: props => <Sort result={props.row.original} moveUp={moveUp} moveDown={moveDown} max={data.length} />
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
        columnHelper.accessor('id', {
            header: 'Action',
            cell: props => <Action raceMode={raceMode} lapBoat={lapBoat} showRetireModal={showRetireModal} resultId={props.getValue()} />
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
        <div key={fleetId}>
            <Table isStriped id={'clubTable'} aria-label='Pursuit Table'>
                <TableHeader>
                    {table
                        .getHeaderGroups()
                        .flatMap(headerGroup => headerGroup.headers)
                        .map(header => {
                            return (
                                <TableColumn key={header.id} className={'text-xl'}>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </TableColumn>
                            )
                        })}
                </TableHeader>
                <TableBody loadingContent={<Spinner />} loadingState={loadingState}>
                    {table.getRowModel().rows.map(row => (
                        <TableRow key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <TableCell key={cell.id} className={'text-xl'}>
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

export default PursuitTable
