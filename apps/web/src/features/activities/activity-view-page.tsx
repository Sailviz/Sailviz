import { Heading } from '@components/ui/heading'
import PageContainer from '@components/layout/page-container'
import { Separator } from '@components/ui/separator'
import ActivityMap from '@components/layout/ActivityMap'

const ActivityViewPage = ({ activityId }: { activityId: string }) => {
    // const race = useQuery(orpcClient.activity.find.queryOptions({ input: { activityId } })).data

    // list of current series
    //list of

    return (
        <PageContainer scrollable={false}>
            <div className='flex flex-1 flex-col space-y-4'>
                <div className='flex items-start justify-between'>
                    <Heading title='Title' description='Date' />
                </div>
                <Separator />
                <ActivityMap raceId={null} windowHeight={600} activityId={activityId} />
            </div>
        </PageContainer>
    )
}

export default ActivityViewPage
