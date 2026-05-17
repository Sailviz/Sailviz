import { type ColumnDef } from '@tanstack/react-table'
import * as Types from '@sailviz/types'
import { CellAction } from './cell-action'

export const columns: ColumnDef<Types.RaceType>[] = [
    {
        accessorKey: 'series.name',
        header: 'Series'
    },
    {
        accessorKey: 'number',
        header: 'Number'
    },
    {
        accessorKey: 'Time',
        header: 'Time',
        cell: ({ row }) => {
            const time = row.original.Time
            return time ? new Date(time).toLocaleString() : 'N/A'
        }
    },

    {
        id: 'actions',
        cell: ({ row }) => <CellAction data={row.original} />
    }
]
