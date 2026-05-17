import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import CreateSeriesModal from '@components/layout/dashboard/CreateSeriesModal'
import { PageSkeleton } from '@components/layout/PageSkeleton'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import { type Session } from '@sailviz/auth/client'
import SeriesTable from '@features/series/series-table'
import { useSeriesTableFilters } from '@features/series/series-table/use-series-table-filters'
import PageContainer from '@components/layout/page-container'
import { Heading } from '@components/ui/heading'
import { Separator } from '@components/ui/separator'
import { Suspense } from 'react'
import { DataTableSkeleton } from '@components/ui/table/data-table-skeleton'

function Page() {
    const session: Session = useLoaderData({ from: `__root__` })
    const { data: org } = useQuery(orpcClient.organization.session.queryOptions())

    const queryClient = useQueryClient()

    const seriesCreation = useMutation(orpcClient.series.create.mutationOptions())

    const createSeries = async (seriesName: string) => {
        await seriesCreation.mutateAsync({
            name: seriesName,
            orgId: session?.session.activeOrganizationId!
        })
        queryClient.invalidateQueries({
            queryKey: orpcClient.series.club.key({ type: 'query' })
        })
    }

    if (!session || !org) {
        return <PageSkeleton />
    }

    return (
        <PageContainer scrollable={false}>
            <div className='flex flex-1 flex-col space-y-4'>
                <div className='flex items-start justify-between'>
                    <Heading title='Series' description='Manage events' />
                    <CreateSeriesModal onSubmit={createSeries} allowCreate={true} />
                </div>
                <Separator />
                <Suspense fallback={<DataTableSkeleton columnCount={3} rowCount={10} />}>
                    <SeriesTable filters={useSeriesTableFilters()} orgId={org.id} />
                </Suspense>
            </div>
        </PageContainer>
    )
}

export const Route = createFileRoute('/Dashboard/Series/')({
    component: Page
})
