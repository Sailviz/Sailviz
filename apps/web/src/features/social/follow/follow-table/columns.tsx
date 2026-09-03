import { type ColumnDef } from '@tanstack/react-table'
import * as Types from '@sailviz/types'
import { FollowAction } from './follow-action'
import { UnfollowAction } from './unfollow-action'
import { RemoveFollowerAction } from './remove-follower-action'

export const followingColumns: ColumnDef<Types.ReducedUserType>[] = [
    {
        accessorKey: 'name',
        header: 'NAME'
    },

    {
        id: 'actions',
        cell: ({ row }) => <UnfollowAction data={row.original} />
    }
]

export const followerColumns: ColumnDef<Types.ReducedUserType>[] = [
    {
        accessorKey: 'name',
        header: 'NAME'
    },

    {
        id: 'actions',
        cell: ({ row }) => <RemoveFollowerAction data={row.original} />
    }
]

export const possibleColumns: ColumnDef<Types.ReducedUserType>[] = [
    {
        accessorKey: 'name',
        header: 'NAME'
    },

    {
        id: 'actions',
        cell: ({ row }) => <FollowAction data={row.original} />
    }
]
