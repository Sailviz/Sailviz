import PageContainer from '@components/layout/page-container'
import { Separator } from '@components/ui/separator'
import ActivityMap from '@components/layout/ActivityMap'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import { ActivityHeader } from './ActivityHeader'
import * as Types from '@sailviz/types'

const ActivityViewPage = ({ activityId }: { activityId: string }) => {
    const activity = useQuery(orpcClient.activity.find.queryOptions({ input: { activityId } })).data as Types.Activity

    const queryClient = useQueryClient()
    const updateActivityMutation = useMutation(orpcClient.activity.update.mutationOptions())

    const updateActivity = async ({ title, description }: { title: string; description: string }) => {
        await updateActivityMutation.mutateAsync({
            id: activity.id,
            title,
            description
        })

        await queryClient.invalidateQueries({ queryKey: orpcClient.activity.find.key({ input: { activityId } }) })
    }

    return (
        <PageContainer scrollable={false}>
            <div className='flex flex-1 flex-col space-y-4'>
                <div className='flex items-start justify-between'>
                    <ActivityHeader
                        activity={activity}
                        onSave={(title, description) => {
                            updateActivity({
                                title,
                                description
                            })
                        }}
                    />
                </div>
                <Separator />
                <ActivityMap raceId={null} windowHeight={600} activityId={activityId} />
            </div>
        </PageContainer>
    )
}

export default ActivityViewPage
