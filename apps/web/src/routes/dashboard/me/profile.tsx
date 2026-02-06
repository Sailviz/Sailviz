import CreateSignOnProfileModal from '@components/layout/myRaces/CreateSignOnProfileModal'
import SignOnProfileTable from '@components/tables/SignOnProfileTable'
import { orpcClient } from '@lib/orpc'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

function Page() {
    const { data: boats } = useQuery(orpcClient.boat.standard.queryOptions())

    return (
        <div>
            <SignOnProfileTable boats={boats} />
            <CreateSignOnProfileModal boats={boats} />
        </div>
    )
}

export const Route = createFileRoute('/dashboard/me/profile')({
    component: Page
})
