import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import { parseNumberSearchParam, useSearchParam } from '@hooks/use-search-param'
import { DataTable } from '@components/tables/data-table'
import { followerColumns, followingColumns, possibleColumns } from './columns'

const pageSizeOptions = [10, 20, 30, 40, 50]

interface FollowTableProps {
    page: number
    searchQuery: string | null
    tagFilter: string | null
}
const pageName = 'seriesPage'
const limitName = 'seriesLimit'

export const FollowingTable = ({ userId, filters }: { userId: string; filters: FollowTableProps }) => {
    const [currentPage, _setCurrentPage] = useSearchParam<number>(pageName, 1, { parse: parseNumberSearchParam })
    const [pageSize, _setPageSize] = useSearchParam<number>(limitName, pageSizeOptions[0] ?? 10, { parse: parseNumberSearchParam })

    const following = useQuery(
        orpcClient.social.follow.getFollowing.queryOptions({
            input: { userId: userId, page: currentPage, pageSize: pageSize, search: filters.searchQuery, tags: filters.tagFilter }
        })
    ).data

    return (
        <>
            <DataTable data={following} columns={followingColumns} totalItems={following?.length} pageName={pageName} limitName={limitName} />
        </>
    )
}

export const FollowerTable = ({ userId, filters }: { userId: string; filters: FollowTableProps }) => {
    const [currentPage, _setCurrentPage] = useSearchParam<number>(pageName, 1, { parse: parseNumberSearchParam })
    const [pageSize, _setPageSize] = useSearchParam<number>(limitName, pageSizeOptions[0] ?? 10, { parse: parseNumberSearchParam })

    const following = useQuery(
        orpcClient.social.follow.getFollowers.queryOptions({
            input: { userId: userId, page: currentPage, pageSize: pageSize, search: filters.searchQuery, tags: filters.tagFilter }
        })
    ).data

    return (
        <>
            <DataTable data={following} columns={followerColumns} totalItems={following?.length} pageName={pageName} limitName={limitName} />
        </>
    )
}

export const PossibleFollowingTable = ({ filters }: { filters: FollowTableProps }) => {
    const [currentPage, _setCurrentPage] = useSearchParam<number>(pageName, 1, { parse: parseNumberSearchParam })
    const [pageSize, _setPageSize] = useSearchParam<number>(limitName, pageSizeOptions[0] ?? 10, { parse: parseNumberSearchParam })

    const following = useQuery(
        orpcClient.social.find_users.queryOptions({
            input: { page: currentPage, pageSize: pageSize, search: filters.searchQuery, tags: filters.tagFilter }
        })
    ).data

    return (
        <>
            <DataTable data={following} columns={possibleColumns} totalItems={following?.length} pageName={pageName} limitName={limitName} />
        </>
    )
}
