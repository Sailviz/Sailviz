import { type ColumnDef } from '@tanstack/react-table'
import * as Types from '@sailviz/types'
import { CellAction } from './cell-action'

export const columns: ColumnDef<Types.SeriesType>[] = [
    {
        accessorKey: 'name',
        header: 'NAME'
    },

    {
        id: 'actions',
        cell: ({ row }) => <CellAction data={row.original} />
    }
]
