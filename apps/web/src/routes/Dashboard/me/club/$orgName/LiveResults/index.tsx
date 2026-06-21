import { createFileRoute } from '@tanstack/react-router'

import LiveResultsViewPage from '@features/club/live-results-view-page'

function Page() {
    const { orgName } = Route.useParams()

    return <LiveResultsViewPage orgName={orgName!} />
}

export const Route = createFileRoute('/Dashboard/me/club/$orgName/LiveResults/')({
    component: Page
})
