import React, { ChangeEvent, useState, useRef } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, SortingState } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip } from '@nextui-org/react'
import { EditIcon } from 'components/icons/edit-icon'
import * as Fetcher from 'components/Fetchers'
import { AVAILABLE_PERMISSIONS, userHasPermission } from 'components/helpers/users'
import { PageSkeleton } from 'components/ui/PageSkeleton'

const columnHelper = createColumnHelper<ResultsDataType>()

const SignOnTable = (props: any) => {
    const { user, userIsError, userIsValidating } = Fetcher.UseUser()
    let [data, setData] = useState<ResultsDataType[]>(props.data)
    let clubId = props.clubId
    let raceId = props.raceId
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
        const onEditClick = () => {
            props.showEditModal(props.row.original)
        }
        if (userHasPermission(props.user, AVAILABLE_PERMISSIONS.editResults)) {
            return (
                <div className='relative flex items-center gap-2'>
                    <Tooltip content='Edit'>
                        <span className='text-lg text-default-400 cursor-pointer active:opacity-50'>
                            <EditIcon onClick={onEditClick} />
                        </span>
                    </Tooltip>
                </div>
            )
        } else {
            return <> </>
        }
    }
    const deleteResult = (id: any) => {
        props.deleteResult(id)
    }

    const showEditModal = (id: any) => {
        props.showEditModal(id)
    }

    const [sorting, setSorting] = useState<SortingState>([])

    let table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('Helm', {
                header: 'Helm',
                cell: props => <Text {...props} />,
                enableSorting: false
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
                cell: props => <Class {...props} clubId={clubId} options={options} />,
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
                cell: props => <Action {...props} deleteResult={deleteResult} showEditModal={showEditModal} user={user} />
            })
        ],
        state: {
            sorting
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel()
    })
    if (userIsValidating || userIsError || user == undefined) {
        return <PageSkeleton />
    }
    return (
        <div key={props.data}>
            <Table
                isStriped
                isHeaderSticky
                removeWrapper
                classNames={{
                    base: 'max-h-[75vh] overflow-scroll',
                    table: ''
                }}
            >
                <TableHeader>
                    {table
                        .getHeaderGroups()
                        .flatMap(headerGroup => headerGroup.headers)
                        .map(header => {
                            return (
                                <TableColumn key={header.id} className={'max-h-'}>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </TableColumn>
                            )
                        })}
                </TableHeader>
                <TableBody emptyContent={'No entries yet.'}>
                    {table.getRowModel().rows.map(row => (
                        <TableRow key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default SignOnTable
