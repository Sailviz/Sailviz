import React, { useEffect, useState, type ChangeEvent } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type SortingState } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table'
import { Button } from '@components/ui/button'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import type { ResultType } from '@sailviz/types'
import EditResultDialog from '@components/layout/dashboard/EditResultModal'
import ViewResultDialog from '@components/layout/dashboard/viewResultModal'
import { MapPin, Upload } from 'lucide-react'
import MapDialog from '@components/layout/dashboard/MapModal'
import type { Session } from '@lib/session'
import { useLoaderData } from '@tanstack/react-router'
import { Input } from '@components/ui/input'
import { XMLParser } from 'fast-xml-parser'

const Text = ({ value }: { value: string }) => {
    return <div className=' text-center'>{value}</div>
}

const Time = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value] = React.useState(new Date((initialValue - props.startTime) * 1000).toISOString().substring(11, 19))
    if (initialValue == -1) {
        return <p className='p-2 m-2 text-center w-full'>Retired</p>
    } else if (initialValue == 0) {
        return <p className='p-2 m-2 text-center w-full'>-</p>
    } else {
        return <p> {value}</p>
    }
}

const CorrectedTime = ({ ...props }) => {
    let value = Math.round(props.getValue())
    let result = props.result
    let valueString = ''
    if (result.resultCode != '') {
        valueString = result.resultCode
    } else {
        valueString = value.toString()
    }
    //round value to nearest integer

    return <div className=' text-center'>{valueString}</div>
}

const columnHelper = createColumnHelper<ResultType>()

const FleetHandicapResultsTable = ({ fleetId, editable, advancedEdit, showTime }: { fleetId: string; editable: boolean; advancedEdit: boolean; showTime: boolean }) => {
    const { data: fleet } = useQuery(orpcClient.fleet.find.queryOptions({ input: { fleetId } }))
    const { data: race } = useQuery(orpcClient.race.find.queryOptions({ input: { raceId: fleet?.raceId || '' }, enabled: fleet !== undefined }))
    const session: Session = useLoaderData({ from: `__root__` })

    const queryClient = useQueryClient()
    const createParticipantMutation = useMutation(orpcClient.trackable.participant.create.mutationOptions())
    const updateResultMutation = useMutation(orpcClient.result.update.mutationOptions())

    const [editModalOpen, setEditModalOpen] = useState(false)
    const [viewModalOpen, setViewModalOpen] = useState(false)
    const [mapModalOpen, setMapModalOpen] = useState(false)
    const [modalData, setModalData] = useState<ResultType | undefined>(undefined)

    let [startTime, setStartTime] = useState(fleet?.startTime || 0)

    const [sorting, setSorting] = useState<SortingState>([
        {
            id: 'HandicapPosition',
            desc: false
        }
    ])

    useEffect(() => {
        console.log('Fleet updated:', fleet)
    }, [fleet])

    useEffect(() => {
        setStartTime(fleet?.startTime || 0)
    }, [fleet?.startTime])

    let columns = [
        columnHelper.accessor('HandicapPosition', {
            header: 'Position',
            cell: props => <Text value={props.getValue().toString()} />,
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
            cell: props => <Text value={props.getValue()?.name || ''} />,
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

    const timeColumn = columnHelper.accessor('finishTime', {
        header: 'Time',
        cell: props => <Time {...props} startTime={startTime} />,
        enableSorting: false
    })

    const correctedTimeColumn = columnHelper.accessor('CorrectedTime', {
        header: 'Corrected Time',
        cell: props => <CorrectedTime {...props} result={fleet?.results?.find(result => result.id == props.row.original.id)} />,
        enableSorting: false
    })

    if (showTime) {
        columns.splice(5, 0, timeColumn)
        columns.splice(6, 0, correctedTimeColumn)
    }

    const editColumn = columnHelper.accessor('id', {
        id: 'Edit',
        header: '',
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
        header: '',
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

    const processGPX = async (text: string, resultId: string) => {
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: ''
        })
        const jsonObj = parser.parse(text)
        const trackPoints = jsonObj.gpx.trk.trkseg.trkpt
        console.log('trackPoints', trackPoints)
        const rows = trackPoints.map((pt: any) => ({
            timestamp: Math.floor(new Date(pt.time).getTime()),
            lat: parseFloat(pt.lat),
            lon: parseFloat(pt.lon),
            accelerometer: { x: 0, y: 0, z: 0 },
            gyro: { x: 0, y: 0, z: 0 }
        }))

        // check if result has an associated participant in trackable, if not, create one.
        const result = fleet?.results?.find(r => r.id == resultId)
        if (!result) {
            console.error('Result not found for id', resultId)
            return
        }
        if (!race?.trackableEventId) {
            console.error('Race not found for fleet', fleetId)
            return
        }
        let participantId = result.trackableParticipantId
        if (participantId == null) {
            //get the id of a tracker that hasn't been used for the event yet

            // create a new trackable participant for this result
            const participant = await createParticipantMutation.mutateAsync({ eventId: race.trackableEventId, deviceId: null, name: `${result.SailNumber}  ${result.Helm}` })
            participantId = participant.id

            await updateResultMutation.mutateAsync({ ...result, trackableParticipantId: participantId })
        }

        const url = import.meta.env.VITE_TRACKABLE_URL + `/api/tracker/high-res-data?participantId=${participantId}`

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(rows)
        })

        if (!res.ok) {
            console.error('Upload failed', await res.text())
            return
        }

        console.log('Upload OK')
        queryClient.invalidateQueries({ queryKey: orpcClient.fleet.find.queryKey({ input: { fleetId } }) })
    }

    const entryFileUploadHandler = async (e: ChangeEvent<HTMLInputElement>, resultId: string) => {
        const inputEl = e.target
        const file = inputEl.files?.[0]
        if (!file) {
            return
        }
        // Reset the input so selecting the same file again will fire onChange
        inputEl.value = ''
        const reader = new FileReader()
        reader.onload = async () => {
            const text = reader.result as string
            await processGPX(text, resultId)
        }
        reader.readAsText(file)
    }

    const trackableColumn = columnHelper.accessor('id', {
        id: 'Trackable',
        header: 'Map',
        cell: props => {
            if (props.row.original.trackableParticipantId) {
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
            } else if (props.row.original.userId == session.user.id && race?.trackableEventId != null) {
                return (
                    <div className='flex flex-row'>
                        <Button className='mx-1 w-1/4' onClick={() => document.getElementById('entryFileUpload')!.click()}>
                            <Upload />
                        </Button>
                        <Input id='entryFileUpload' type='file' accept='.gpx' onChange={e => entryFileUploadHandler(e, props.row.original.id)} className='hidden' />
                    </div>
                )
            } else {
                return <div className='text-center'>-</div>
            }
        }
    })

    if (editable) {
        columns.push(editColumn)
    } else {
        columns.push(viewColumn)
    }

    columns.push(trackableColumn)

    let table = useReactTable({
        data: fleet?.results || [],
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
            <EditResultDialog open={editModalOpen} result={modalData} advancedEdit={advancedEdit} onClose={() => setEditModalOpen(false)} />
            <ViewResultDialog open={viewModalOpen} result={modalData} onClose={() => setViewModalOpen(false)} />
            <MapDialog open={mapModalOpen} result={modalData} onClose={() => setMapModalOpen(false)} />

            <div className='flex items-center py-4'>
                <h1>
                    {fleet?.fleetSettings?.name}: {fleet?.results?.length} boats entered
                </h1>
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

export default FleetHandicapResultsTable
