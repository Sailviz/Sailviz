import PageContainer from '@components/layout/page-container'
import { DataTableSkeleton } from '@components/ui/table/data-table-skeleton'
import UserActivitiesTable from '@features/user/activities-table'
import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'

function Page() {
    return (
        <PageContainer scrollable={false}>
            <div className='flex flex-1 flex-col space-y-4'>
                <Suspense fallback={<DataTableSkeleton columnCount={3} rowCount={10} />}>
                    <UserActivitiesTable />
                </Suspense>
            </div>
        </PageContainer>
    )
}

export const Route = createFileRoute('/Dashboard/me/activities')({
    component: Page
})
