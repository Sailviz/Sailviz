import { useState, type ChangeEvent } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type SortingState } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table'
import { Button } from '@components/ui/button'
import { useMutation, useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import type { BoatType, ResultType } from '@sailviz/types'
import EditResultModal from '@components/layout/dashboard/EditResultModal'
import ViewResultDialog from '@components/layout/dashboard/viewResultModal'
import { MapPin, Upload } from 'lucide-react'
import type { Session } from '@lib/session'
import { useLoaderData } from '@tanstack/react-router'
import { Input } from '@components/ui/input'
import { useUploadGPXFile } from '@features/activities/upload'
import { queryClient } from '@lib/queryClient'
import MapDialog from '@components/layout/dashboard/MapModal'

const Text = ({ value }: { value: string }) => {
    return <div>{value}</div>
}
const Class = ({ value }: { value: BoatType }) => {
    return <div>{value.name}</div>
}

const columnHelper = createColumnHelper<ResultType>()

const FleetPursuitResultsTable = ({ fleetId, editable, advancedEdit }: { fleetId: string; editable: boolean; advancedEdit: boolean }) => {
    const { data: fleet } = useQuery(orpcClient.fleet.find.queryOptions({ input: { fleetId } }))
    const { data: race } = useQuery(orpcClient.race.find.queryOptions({ input: { raceId: fleet?.raceId || '' }, enabled: fleet !== undefined }))
    const session: Session = useLoaderData({ from: `__root__` })
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [viewModalOpen, setViewModalOpen] = useState(false)
    const [modalData, setModalData] = useState<ResultType | undefined>(undefined)

    const { uploadGPXFile } = useUploadGPXFile()
    const linkActivityToResult = useMutation(orpcClient.activity.linkToResult.mutationOptions())
    const [mapModalOpen, setMapModalOpen] = useState(false)

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
            // If the resultCode is empty, display position, otherwise display resultCode
            cell: props => <Text value={props.row.original.resultCode == '' ? props.getValue().toString() : props.row.original.resultCode} />,
            enableSorting: true
        }),
        columnHelper.accessor('Helm', {
            header: 'Helm',
            cell: props => <Text value={props.getValue()} />,
            enableSorting: false
        }),
        columnHelper.accessor('Crew', {
            header: 'Crew',
            cell: props => <Text value={props.getValue()} />,
            enableSorting: false
        }),
        columnHelper.accessor('boat', {
            header: 'Class',
            id: 'Class',
            size: 300,
            cell: props => <Class value={props.getValue()} />,
            enableSorting: false
        }),
        columnHelper.accessor('SailNumber', {
            header: 'Sail Number',
            cell: props => <Text value={props.getValue()} />,
            enableSorting: false
        }),
        columnHelper.accessor('numberLaps', {
            header: 'Laps',
            cell: props => <Text value={props.getValue().toString()} />,
            enableSorting: false
        })
    ]

    const editColumn = columnHelper.accessor('id', {
        id: 'Edit',
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

    const viewColumn = columnHelper.accessor('id', {
        id: 'View',
        cell: props => (
            <Button
                onClick={() => {
                    setViewModalOpen(true)
                    setModalData(props.row.original)
                }}
            >
                View
            </Button>
        )
    })

    if (editable) {
        columns.push(editColumn)
    } else {
        columns.push(viewColumn)
    }

    const entryFileUploadHandler = async (e: ChangeEvent<HTMLInputElement>, resultId: string) => {
        const inputEl = e.target
        const file = inputEl.files?.[0]
        if (!file) {
            return
        }

        const activity = await uploadGPXFile(file, resultId)
        if (!activity) {
            console.error('Failed to upload activity')
            return
        }
        await linkActivityToResult.mutateAsync({ activityId: activity.id, resultId })
        // Reset the input so selecting the same file again will fire onChange

        await queryClient.invalidateQueries({ queryKey: orpcClient.fleet.find.queryKey({ input: { fleetId } }) })
    }

    const trackableColumn = columnHelper.accessor('id', {
        id: 'Trackable',
        header: 'Map',
        cell: props => {
            if (props.row.original.trackableParticipantId || props.row.original.activityId) {
                return (
                    <Button
                        onClick={() => {
                            setMapModalOpen(true)
                            setModalData(props.row.original)
                        }}
                    >
                        <MapPin />
                    </Button>
                )
            } else if (!('error' in session)) {
                if (props.row.original.userId == session.user.id && race?.trackableEventId != null) {
                    return (
                        <div className='flex flex-row'>
                            <Button className='mx-1 w-1/4' onClick={() => document.getElementById('entryFileUpload')!.click()}>
                                <Upload />
                            </Button>
                            <Input id='entryFileUpload' type='file' accept='.gpx' onChange={e => entryFileUploadHandler(e, props.row.original.id)} className='hidden' />
                        </div>
                    )
                }
            } else {
                return <div className='text-center'>-</div>
            }
        }
    })

    columns.push(trackableColumn)

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
            <MapDialog open={mapModalOpen} result={modalData} onClose={() => setMapModalOpen(false)} />
            <EditResultModal open={editModalOpen} result={modalData} advancedEdit={advancedEdit} onClose={() => setEditModalOpen(false)} />
            <ViewResultDialog open={viewModalOpen} result={modalData} onClose={() => setViewModalOpen(false)} />
            <div className='flex items-center py-4'>
                <h1>{data.length} boats entered</h1>
            </div>
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

export default FleetPursuitResultsTable
