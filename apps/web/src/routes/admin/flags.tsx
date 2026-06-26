import { PageSkeleton } from '@components/layout/PageSkeleton'
import { title } from '@components/layout/home/primitaves'
import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import type { Session } from '@sailviz/auth/client'
import CreateFlagDialog from '@components/layout/dashboard/CreateFlagModal'
import StandardFlagTable from '@components/tables/StandardFlagTable'

function Page() {
    const session: Session = useLoaderData({ from: `__root__` })

    if (session == null) {
        // If the user is not authenticated, redirect to the login page
        return <PageSkeleton />
    }

    return (
        <div className='flex flex-col h-full'>
            <div className='p-6'>
                <h1 className={title({ color: 'blue' })}>Flags</h1>
            </div>
            <div className='p-6'>
                <div className='flex flex-row p-6 justify-around'>
                    <CreateFlagDialog custom={false} />
                </div>
                <StandardFlagTable />
            </div>
        </div>
    )
}
export const Route = createFileRoute('/admin/flags')({
    component: Page
})
