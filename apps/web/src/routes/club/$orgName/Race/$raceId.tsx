import { createFileRoute } from '@tanstack/react-router'
import HomeNav from '@components/layout/home/navbar'
import RaceViewPage from '@features/club/race-view-page'

function Page() {
    const { raceId, orgName } = Route.useParams()

    // list of current series
    //list of

    return (
        <>
            <HomeNav />
            <RaceViewPage raceId={raceId!} orgName={orgName!} />
        </>
    )
}

export const Route = createFileRoute('/club/$orgName/Race/$raceId')({
    component: Page
})
