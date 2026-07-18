import PageContainer from '@components/layout/page-container'
import { DataTableSkeleton } from '@components/ui/table/data-table-skeleton'
import UserResultsTable from '@features/user/results-table'
import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'

function Page() {
    return (
        <PageContainer scrollable={false}>
            <div className='flex flex-1 flex-col space-y-4'>
                <Suspense fallback={<DataTableSkeleton columnCount={3} rowCount={10} />}>
                    <UserResultsTable />
                </Suspense>
            </div>
        </PageContainer>
    )
}

export const Route = createFileRoute('/Dashboard/me/races')({
    component: Page
})
