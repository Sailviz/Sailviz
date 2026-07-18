import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import { parseNumberSearchParam, useSearchParam } from '@hooks/use-search-param'
import { DataTable } from '@components/tables/data-table'
import { columns } from './columns'

const pageSizeOptions = [10, 20, 30, 40, 50]

const pageName = 'seriesPage'
const limitName = 'seriesLimit'

const UserResultsTable = () => {
    const [currentPage, _setCurrentPage] = useSearchParam<number>(pageName, 1, { parse: parseNumberSearchParam })
    const [pageSize, _setPageSize] = useSearchParam<number>(limitName, pageSizeOptions[0] ?? 10, { parse: parseNumberSearchParam })

    const { data } = useQuery(orpcClient.user.results.all.queryOptions({ input: { page: currentPage, pageSize: pageSize } }))

    console.log('series data', data)
    return (
        <>
            <DataTable data={data?.results} columns={columns} totalItems={data?.resultCount} pageName={pageName} limitName={limitName} />
        </>
    )
}

export default UserResultsTable
