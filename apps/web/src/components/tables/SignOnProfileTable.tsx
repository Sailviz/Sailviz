import { useState } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, type SortingState, useReactTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import * as Types from '@sailviz/types'
import { type Session } from '@sailviz/auth/client'
import { useLoaderData } from '@tanstack/react-router'
import EditSignOnProfileModal from '@components/layout/myRaces/EditSignOnProfileModal'

const Action = ({ profile, onClick }: { profile: Types.SignOnProfile; onClick: (member: Types.SignOnProfile) => void }) => {
    return (
        <div className='relative flex items-center gap-2 cursor-pointer'>
            <Button onClick={() => onClick(profile)}>Edit</Button>
        </div>
    )
}

const columnHelper = createColumnHelper<Types.SignOnProfile>()

const SignOnProfileTable = () => {
    const session: Session = useLoaderData({ from: `__root__` })

    const [data] = useState<Types.SignOnProfile[]>(session.user.profile.signOnProfiles)

    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [modalData, setModalData] = useState<Types.SignOnProfile | undefined>(undefined)

    function onEdit(member: Types.SignOnProfile) {
        setModalData(member)
        setModalIsOpen(true)
    }

    const [sorting, setSorting] = useState<SortingState>([
        {
            id: 'number',
            desc: false
        }
    ])

    var table = useReactTable({
        data,
        columns: [
            columnHelper.accessor(profile => profile.Helm, {
                id: 'Helm',
                cell: info => info.getValue(),
                enableSorting: true
            }),
            columnHelper.accessor(profile => profile.Crew, {
                id: 'Crew',
                cell: info => info.getValue(),
                enableSorting: true
            }),
            columnHelper.accessor(profile => profile.Boat, {
                id: 'Boat',
                header: 'Action'
            }),
            columnHelper.accessor(profile => profile.Helm, {
                id: 'Sail Number',
                header: 'Action'
            }),
            columnHelper.accessor(profile => profile.userID, {
                header: 'Action',
                cell: props => <Action profile={props.row.original} onClick={onEdit} />
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
        <div className='rounded-md border w-full'>
            <EditSignOnProfileModal open={modalIsOpen} profile={modalData!} onClose={() => setModalIsOpen(false)} />
            <Table aria-label='Profiles Table'>
                <TableHeader>
                    <TableRow>
                        {table
                            .getHeaderGroups()
                            .flatMap(headerGroup => headerGroup.headers)
                            .map(header => {
                                return <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                            })}
                    </TableRow>
                </TableHeader>
                <TableBody>
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

export default SignOnProfileTable
