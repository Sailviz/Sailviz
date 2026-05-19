import { createFileRoute } from '@tanstack/react-router'
import RaceViewPage from '@features/club/race-view-page'

function Page() {
    const { raceId, orgName } = Route.useParams()

    return (
        <>
            <RaceViewPage raceId={raceId!} orgName={orgName} />
        </>
    )
}
export const Route = createFileRoute('/Dashboard/me/club/$orgName/Race/$raceId')({
    component: Page
})
