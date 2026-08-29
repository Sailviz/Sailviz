import PageContainer from '@components/layout/page-container'
import { ActivitySharePage } from '@features/activities/share'
import { createFileRoute } from '@tanstack/react-router'

function Page() {
    const { activityId } = Route.useParams()

    return (
        <PageContainer scrollable={false}>
            <div className='flex flex-1 flex-col space-y-4'>
                <ActivitySharePage activityId={activityId} />
            </div>
        </PageContainer>
    )
}

export const Route = createFileRoute('/Dashboard/me/share/$activityId')({
    component: Page
})
