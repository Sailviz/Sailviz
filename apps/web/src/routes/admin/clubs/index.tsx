import { title } from '@components/layout/home/primitaves'
import { useLoaderData, createFileRoute, redirect } from '@tanstack/react-router'
import { PageSkeleton } from '@components/layout/PageSkeleton'
import TableOfClubs from '@components/tables/TableOfClubs'
import CreateClubModal from '@components/layout/dashboard/CreateClubModal'
import { ensureAdmin } from 'src/lib/session'

function Page() {
    const session = useLoaderData({ from: `__root__` })

    if (!session) {
        // If the user is not authenticated, redirect to the login page
        return <PageSkeleton />
    }

    return (
        <div>
            <div className='p-6'>
                <h1 className={title({ color: 'blue' })}>Clubs</h1>
            </div>
            <div className='p-6'>
                <CreateClubModal />
            </div>
            <div className='p-6'>
                <TableOfClubs />
            </div>
        </div>
    )
}

export const Route = createFileRoute('/admin/clubs/')({
    component: Page,
    beforeLoad: async ({ context }) => {
        const session = await ensureAdmin(context.queryClient)
        if (!session) throw redirect({ to: '/Login' })
    }
})
