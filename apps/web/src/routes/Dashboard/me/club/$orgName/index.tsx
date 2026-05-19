import { createFileRoute } from '@tanstack/react-router'
import ClubViewPage from '@features/club/club-view-page'

function Page() {
    const { orgName } = Route.useParams()

    return (
        <>
            <ClubViewPage orgName={orgName!} />
        </>
    )
}

export const Route = createFileRoute('/Dashboard/me/club/$orgName/')({
    component: Page
})
