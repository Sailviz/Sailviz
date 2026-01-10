import type { Session } from '@lib/session'
import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import InvitationsTable from '@components/tables/InvitationsTable'

function Page() {
    const session: Session = useLoaderData({ from: `__root__` })

    return (
        <div>
            Hello {session?.user.name}
            <div> Pending Invitations:</div>
            <InvitationsTable />
        </div>
    )
}

export const Route = createFileRoute('/dashboard/me/')({
    component: Page
})
