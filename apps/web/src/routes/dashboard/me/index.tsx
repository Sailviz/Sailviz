import type { Session } from '@lib/session'
import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import InvitationsTable from '@components/tables/InvitationsTable'
import UpcomingRacesTable from '@components/tables/UpcomingRacesTable'
import CreateResultModal from '@components/layout/myRaces/CreateResultModal'

function Page() {
    const session: Session = useLoaderData({ from: `__root__` })
    console.log('Session in /dashboard/me/: ', session)
    return (
        <div>
            Hello {session?.user.name}
            <div> Pending Invitations:</div>
            <InvitationsTable />
            {session.user.profile?.userFavouriteOrgs.map((org: any) => (
                <div>
                    <h1 key={org.orgId}> {org.organization.name} </h1>
                    <UpcomingRacesTable orgId={org.orgId} />
                    <div className='mt-2 text-center max-h-[5vh] overflow-hidden'>
                        <CreateResultModal org={org.organization} />
                    </div>
                </div>
            ))}
        </div>
    )
}

export const Route = createFileRoute('/dashboard/me/')({
    component: Page
})
