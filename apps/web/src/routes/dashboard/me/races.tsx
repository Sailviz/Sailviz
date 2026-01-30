import UserRacesTable from '@components/tables/UserRacesTable'
import type { Session } from '@lib/session'
import { createFileRoute, useLoaderData } from '@tanstack/react-router'

function Page() {
    const session: Session = useLoaderData({ from: `__root__` })

    return (
        <div>
            <UserRacesTable userId={session.user.id} viewHref='' />
        </div>
    )
}

export const Route = createFileRoute('/dashboard/me/races')({
    component: Page
})
