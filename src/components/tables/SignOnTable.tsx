'use client'
import React, { ChangeEvent, useState, useRef, useEffect } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, SortingState } from '@tanstack/react-table'
import { EditIcon } from '@/components/icons/edit-icon'
import * as Fetcher from '@/components/Fetchers'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@/components/helpers/users'
import { PageSkeleton } from '@/components/layout/PageSkeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useSession } from '@/lib/auth-client'
const columnHelper = createColumnHelper<ResultDataType>()

const SignOnTable = ({ raceId }: { raceId: string }) => {
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()
    const { race, raceIsError, raceIsValidating } = Fetcher.Race(raceId, true)
    let [data, setData] = useState<ResultDataType[]>([])
    let options: object[] = []

    const Text = ({ ...props }) => {
        const initialValue = props.getValue()
        const [value, setValue] = React.useState(initialValue)

        return (
            <>
                <div>{value}</div>
            </>
        )
    }

    const Number = ({ ...props }: any) => {
        const initialValue = props.getValue()
        const [value, setValue] = React.useState(initialValue)

        return (
            <>
                <div>{value}</div>
            </>
        )
    }

    const Class = ({ ...props }: any) => {
        var initialValue = props.getValue()
        if (initialValue == null) {
            initialValue = { value: '', label: '' }
        }
        const [value, setValue] = React.useState(initialValue)

        const key = props.column.id + '_' + props.row.id

        return (
            <>
                <div>{value.name}</div>
            </>
        )
    }

    const Action = ({ ...props }: any) => {
        if (userHasPermission(props.user, AVAILABLE_PERMISSIONS.editResults)) {
            return (
                <Link href={`/SignOn/editResult/${race.id}/${props.row.original.id}`}>
                    <div className='relative flex items-center gap-2'>
                        <span className='text-lg text-default-400 cursor-pointer active:opacity-50'>
                            <EditIcon />
                        </span>
                    </div>
                </Link>
            )
        } else {
            return <> </>
        }
    }

    const [sorting, setSorting] = useState<SortingState>([])

    const loadingState = session == undefined || race == undefined ? 'loading' : 'idle'

    useEffect(() => {
        if (race == undefined) return
        setData(race.fleets.flatMap(fleet => fleet.results))
    }, [race])

    let table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('Helm', {
                header: 'Helm',
                cell: props => <Text {...props} />,
                enableSorting: false,
                meta: { 'aria-label': 'Helm' }
            }),
            columnHelper.accessor('Crew', {
                header: 'Crew',
                cell: props => <Text {...props} />,
                enableSorting: false
            }),
            columnHelper.accessor('boat', {
                header: 'Class',
                id: 'Class',
                size: 300,
                cell: props => <Class {...props} options={options} />,
                enableSorting: false
            }),
            columnHelper.accessor('SailNumber', {
                header: 'Sail Number',
                cell: props => <Number {...props} disabled={false} />,
                enableSorting: false
            }),
            columnHelper.display({
                id: 'Edit',
                header: 'Edit',
                cell: props => <Action {...props} user={session!.user} />
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
        <div className='w-full max-h-[73vh] overflow-scroll'>
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
