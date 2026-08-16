import { useMemo, useState } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type SortingState } from '@tanstack/react-table'
import { ChevronDownIcon } from '@components/icons/chevron-down-icon'
import { ChevronUpIcon } from '@components/icons/chevron-up-icon'
import { SmoothSpinner } from '@components/icons/smooth-spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table'
import { Button } from '@components/ui/button'
import * as Types from '@sailviz/types'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'

enum raceStateType {
    running,
    sequenceHold,
    stopped,
    reset,
    calculate,
    retire
}

const Text = ({ text }: { text: string }) => {
    return <div>{text}</div>
}

const StartTime = ({ seconds }: { seconds: number }) => {
    //display the start time in mm:ss format
    return <div>{new Date(seconds * 1000).toISOString().substr(14, 5)}</div>
}

const Position = ({ text, result }: { text: string; result: Types.ResultType }) => {
    if (result.resultCode != '') {
        text = result.resultCode
    }
    return <div>{text}</div>
}

const Laps = ({ laps }: { laps: LapDataType[] }) => {
    return <div>{laps.length}</div>
}

const Class = ({ boat }: { boat: Types.BoatType }) => {
    return <div>{boat.name}</div>
}

const Sort = ({
    result,
    max,
    moveUp,
    moveDown
}: {
    result: Types.ResultType
    max: number
    moveUp: (id: string) => Promise<void>
    moveDown: (id: string) => Promise<void>
}) => {
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

const Action = ({ raceState, result, showRetireModal }: { raceState: raceStateType; result: Types.ResultType; showRetireModal: (id: string) => void }) => {
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

const columnHelper = createColumnHelper<Types.ResultType>()

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
    const fleet = useQuery(orpcClient.fleet.find.queryOptions({ input: { fleetId } })).data as Types.FleetType
    const data = useMemo(() => {
        return fleet?.results?.filter(r => r.resultCode === '') ?? []
    }, [fleet])

    const [sorting, setSorting] = useState<SortingState>([
        {
            id: 'PursuitPosition',
            desc: false
        }
    ])

    const columns = useMemo(
        () => [
            columnHelper.accessor('PursuitPosition', {
                header: 'Position',
                cell: props => <Position text={props.getValue().toString()} result={props.row.original} />,
                enableSorting: true
            }),
            columnHelper.display({
                header: 'Adjust Position',
                id: 'Sort',
                // max is the number of boats without a result code
                cell: props => (
                    <Sort result={props.row.original} moveUp={moveUp} moveDown={moveDown} max={data.filter((result: Types.ResultType) => result.resultCode == '').length} />
                )
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
            columnHelper.accessor(result => (result.laps.slice(-1)[0]?.time || 0) - (fleet?.startTime || 0), {
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
        ],
        [moveUp, moveDown, raceState, showRetireModal]
    )

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
