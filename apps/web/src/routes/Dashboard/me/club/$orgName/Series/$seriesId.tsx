import { createFileRoute } from '@tanstack/react-router'
import SeriesViewPage from '@features/club/series-view-page'

function Page() {
    const { seriesId, orgName } = Route.useParams()

    // list of current series
    //list of

    return (
        <>
            <SeriesViewPage seriesId={seriesId!} orgName={orgName} />
        </>
    )
}
export const Route = createFileRoute('/Dashboard/me/club/$orgName/Series/$seriesId')({
    component: Page
})
