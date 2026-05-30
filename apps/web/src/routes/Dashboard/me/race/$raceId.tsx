import { createFileRoute } from '@tanstack/react-router'
import RaceViewPage from '@features/club/race-view-page'

function Page() {
    const { raceId } = Route.useParams()

    return (
        <>
            <RaceViewPage raceId={raceId!} orgName={undefined} />
        </>
    )
}
export const Route = createFileRoute('/Dashboard/me/race/$raceId')({
    component: Page
})
