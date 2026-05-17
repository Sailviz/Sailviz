import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import { parseNumberSearchParam, useSearchParam } from '@hooks/use-search-param'
import { DataTable } from '@components/tables/data-table'
import { columns } from './columns'

const pageSizeOptions = [10, 20, 30, 40, 50]

interface RaceTableProps {
    page: number
    searchQuery: string | null
}

const pageName = 'racePage'
const limitName = 'raceLimit'

const RaceTable = ({ orgId, filters, historical, date }: { orgId: string; filters: RaceTableProps; historical: boolean; date: Date }) => {
    const [currentPage, _setCurrentPage] = useSearchParam<number>(pageName, 1, { parse: parseNumberSearchParam })
    const [pageSize, _setPageSize] = useSearchParam<number>(limitName, pageSizeOptions[0] ?? 10, { parse: parseNumberSearchParam })

    const { data } = useQuery(
        orpcClient.race.org.queryOptions({
            input: { orgId: orgId, page: currentPage, pageSize: pageSize, search: filters.searchQuery, date: date.toISOString(), historical }
        })
    )

    return (
        <>
            <DataTable data={data?.races} columns={columns} totalItems={data?.count} pageName={pageName} limitName={limitName} />
        </>
    )
}

export default RaceTable
