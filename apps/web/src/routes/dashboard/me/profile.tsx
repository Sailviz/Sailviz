import CreateSignOnProfileModal from '@components/layout/myRaces/CreateSignOnProfileModal'
import PageContainer from '@components/layout/page-container'
import InvitationsTable from '@components/tables/InvitationsTable'
import MembershipsTable from '@components/tables/MembershipsTable'
import SignOnProfileTable from '@components/tables/SignOnProfileTable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import FindSailorModal from '@features/social/follow/find-sailor-modal'
import { FollowerTable, FollowingTable } from '@features/social/follow/follow-table'
import { orpcClient } from '@lib/orpc'
import type { Session } from '@lib/session'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useLoaderData } from '@tanstack/react-router'

function Page() {
    const session: Session = useLoaderData({ from: `__root__` })
    const userId = session.user.id
    const { data: boats } = useQuery(orpcClient.boat.standard.all.queryOptions())

    return (
        <PageContainer scrollable={true}>
            <div className='flex flex-1 flex-col space-y-4'>
                <Tabs defaultValue='profiles' className='w-[400px]'>
                    <TabsList>
                        <TabsTrigger value='profiles'>Profiles</TabsTrigger>
                        <TabsTrigger value='following'>Following</TabsTrigger>
                        <TabsTrigger value='followers'>Followers</TabsTrigger>
                        <TabsTrigger value='clubs'>Clubs</TabsTrigger>
                    </TabsList>
                    <TabsContent value='profiles'>
                        <SignOnProfileTable boats={boats} />
                        <CreateSignOnProfileModal boats={boats} />
                    </TabsContent>
                    <TabsContent value='following'>
                        <FindSailorModal />
                        <FollowingTable userId={userId} filters={{ page: 1, searchQuery: null, tagFilter: null }} />
                    </TabsContent>
                    <TabsContent value='followers'>
                        <FollowerTable userId={userId} filters={{ page: 1, searchQuery: null, tagFilter: null }} />
                    </TabsContent>
                    <TabsContent value='clubs'>
                        <MembershipsTable userId={session.user.id} />
                        <div> Pending Invitations:</div>
                        <InvitationsTable />
                    </TabsContent>
                </Tabs>
            </div>
        </PageContainer>
    )
}

export const Route = createFileRoute('/Dashboard/me/profile')({
    component: Page
})
