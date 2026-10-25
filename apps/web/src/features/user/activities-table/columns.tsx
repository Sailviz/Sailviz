import { type ColumnDef } from '@tanstack/react-table'
import * as Types from '@sailviz/types'
import { Open } from './actions/open'
import { Share } from './actions/share'

export const columns: ColumnDef<Types.Activity>[] = [
    {
        accessorKey: 'type',
        header: 'Activity'
    },
    {
        accessorKey: 'Time',
        header: 'Time',
        cell: ({ row }) => {
            const time = row.original.createdAt
            return time ? new Date(time).toLocaleString() : 'N/A'
        }
    },
    {
        id: 'actions',
        cell: ({ row }) => <Open data={row.original} />
    },
    {
        id: 'share',
        cell: ({ row }) => <Share data={row.original} />
    }
]
