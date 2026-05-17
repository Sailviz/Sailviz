import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import { parseNumberSearchParam, useSearchParam } from '@hooks/use-search-param'
import { DataTable } from '@components/tables/data-table'
import { columns } from './columns'
import SeriesTableAction from './series-table-action'

const pageSizeOptions = [10, 20, 30, 40, 50]

interface SeriesTableProps {
    page: number
    searchQuery: string | null
    tagFilter: string | null
}
const pageName = 'seriesPage'
const limitName = 'seriesLimit'

const SeriesTable = ({ orgId, filters }: { orgId: string; filters: SeriesTableProps }) => {
    const [currentPage, _setCurrentPage] = useSearchParam<number>(pageName, 1, { parse: parseNumberSearchParam })
    const [pageSize, _setPageSize] = useSearchParam<number>(limitName, pageSizeOptions[0] ?? 10, { parse: parseNumberSearchParam })

    const { data } = useQuery(
        orpcClient.series.club.queryOptions({ input: { orgId: orgId, page: currentPage, pageSize: pageSize, search: filters.searchQuery, tags: filters.tagFilter } })
    )

    console.log('series data', data)
    return (
        <>
            <SeriesTableAction />
            <DataTable data={data?.series} columns={columns} totalItems={data?.seriesCount} pageName={pageName} limitName={limitName} />
        </>
    )
}

export default SeriesTable
