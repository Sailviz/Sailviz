import CreateSignOnProfileModal from '@components/layout/myRaces/CreateSignOnProfileModal'
import PageContainer from '@components/layout/page-container'
import SignOnProfileTable from '@components/tables/SignOnProfileTable'
import { orpcClient } from '@lib/orpc'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

function Page() {
    const { data: boats } = useQuery(orpcClient.boat.standard.all.queryOptions())

    return (
        <PageContainer scrollable={true}>
            <div className='flex flex-1 flex-col space-y-4'>
                <SignOnProfileTable boats={boats} />
                <CreateSignOnProfileModal boats={boats} />
            </div>
        </PageContainer>
    )
}

export const Route = createFileRoute('/Dashboard/me/profile')({
    component: Page
})
