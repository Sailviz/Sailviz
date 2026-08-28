import { useState, useEffect } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type SortingState } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import type { BoatType, FleetType, RaceType, ResultType } from '@sailviz/types'
import EditResultDialog from '@components/layout/dashboard/EditResultModal'
import { Button } from '@components/ui/button'

const columnHelper = createColumnHelper<ResultType>()

const SignOnTable = ({ raceId }: { raceId: string }) => {
    const race = useQuery(orpcClient.race.find.queryOptions({ input: { raceId: raceId } })).data as RaceType
    let [data, setData] = useState<ResultType[]>([])

    const [editModalOpen, setEditModalOpen] = useState(false)
    const [modalData, setModalData] = useState<ResultType | undefined>(undefined)

    const Text = ({ text }: { text: string }) => {
        return (
            <>
                <div>{text}</div>
            </>
        )
    }

    const Number = ({ value }: { value: number }) => {
        return (
            <>
                <div>{value}</div>
            </>
        )
    }

    const Class = ({ boat }: { boat: BoatType }) => {
        return (
            <>
                <div>{boat.name}</div>
            </>
        )
    }

    const [sorting, setSorting] = useState<SortingState>([])

    useEffect(() => {
        if (race == undefined) return
        setData(race.fleets.flatMap((fleet: FleetType) => fleet.results as ResultType[]))
    }, [race])

    let table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('Helm', {
                header: 'Helm',
                cell: props => <Text text={props.getValue()} />,
                enableSorting: false,
                meta: { 'aria-label': 'Helm' }
            }),
            columnHelper.accessor('Crew', {
                header: 'Crew',
                cell: props => <Text text={props.getValue()} />,
                enableSorting: false
            }),
            columnHelper.accessor('boat', {
                header: 'Class',
                id: 'Class',
                size: 300,
                cell: props => <Class boat={props.getValue()} />,
                enableSorting: false
            }),
            columnHelper.accessor('SailNumber', {
                header: 'Sail Number',
                cell: props => <Number value={props.getValue()} />,
                enableSorting: false
            }),
            columnHelper.display({
                id: 'Edit',
                header: 'Edit',
                cell: props => (
                    <Button
                        onClick={() => {
                            setEditModalOpen(true)
                            setModalData(props.row.original)
                        }}
                    >
                        Edit
                    </Button>
                )
            })
        ],
        state: {
            sorting
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel()
    })
    return (
        <div className='w-full max-h-[73vh] overflow-auto'>
            <EditResultDialog open={editModalOpen} result={modalData} advancedEdit={false} onClose={() => setEditModalOpen(false)} />
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

export default SignOnTable
