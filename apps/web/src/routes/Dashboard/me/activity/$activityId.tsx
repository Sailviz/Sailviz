import { createFileRoute } from '@tanstack/react-router'
import ActivityViewPage from '@features/activities/activity-view-page'

function Page() {
    const { activityId } = Route.useParams()

    return (
        <>
            <ActivityViewPage activityId={activityId!} />
        </>
    )
}
export const Route = createFileRoute('/Dashboard/me/activity/$activityId')({
    component: Page
})
