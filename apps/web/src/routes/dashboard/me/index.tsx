import type { Session } from '@lib/session'
import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import InvitationsTable from '@components/tables/InvitationsTable'
import UpcomingRacesTable from '@components/tables/UpcomingRacesTable'
import CreateResultModal from '@components/layout/myRaces/CreateResultModal'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import * as Types from '@sailviz/types'

function Page() {
    const session: Session = useLoaderData({ from: `__root__` })
    const favouriteOrgs = useQuery(orpcClient.user.favouriteOrgs.queryOptions()).data as Types.userFavouriteOrgsType[]

    if (favouriteOrgs == undefined) {
        return <div>Loading...</div>
    }
    console.log(favouriteOrgs)
    return (
        <div>
            Hello {session?.user.name}
            <div> Pending Invitations:</div>
            <InvitationsTable />
            {favouriteOrgs?.map((org: any) => (
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
