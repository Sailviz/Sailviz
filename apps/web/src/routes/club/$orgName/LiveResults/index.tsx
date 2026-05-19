import { createFileRoute } from '@tanstack/react-router'

import LiveResultsViewPage from '@features/club/live-results-view-page'

function Page() {
    const { orgName } = Route.useParams()
    return (
        <div>
            <LiveResultsViewPage orgName={orgName!} />
        </div>
    )
}

export const Route = createFileRoute('/club/$orgName/LiveResults/')({
    component: Page
})
