import { type ColumnDef } from '@tanstack/react-table'
import * as Types from '@sailviz/types'
import { CellAction } from './cell-action'
import { Share } from './share'

export const columns: ColumnDef<Types.Activity>[] = [
    {
        accessorKey: 'type',
        header: 'Activity'
    },
    {
        accessorKey: 'Time',
        header: 'Time',
        cell: ({ row }) => {
            const time = row.original.startTime
            return time ? new Date(time).toLocaleString() : 'N/A'
        }
    },
    {
        id: 'actions',
        cell: ({ row }) => <CellAction data={row.original} />
    },
    {
        id: 'share',
        cell: ({ row }) => <Share data={row.original} />
    }
]
