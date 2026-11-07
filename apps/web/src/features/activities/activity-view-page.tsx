import PageContainer from '@components/layout/page-container'
import { Separator } from '@components/ui/separator'
import ActivityMap from '@components/layout/ActivityMap'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import { ActivityHeader } from './ActivityHeader'
import * as Types from '@sailviz/types'
import { Button } from '@components/ui/button'
import { Upload } from 'lucide-react'
import { Input } from '@components/ui/input'
import { useUploadGPXFile } from './upload'
import type { ChangeEvent } from 'react'
import { useLoaderData } from '@tanstack/react-router'
import type { Session } from '@lib/session'

const ActivityViewPage = ({ activityId }: { activityId: string }) => {
    const session: Session = useLoaderData({ from: `__root__` })
    const activity = useQuery(orpcClient.activity.find.queryOptions({ input: { activityId } })).data as Types.Activity

    const queryClient = useQueryClient()
    const updateActivityMutation = useMutation(orpcClient.activity.update.mutationOptions())
    const analyseActivityMutation = useMutation(orpcClient.activity.analyse.mutationOptions())

    const { uploadGPXFile } = useUploadGPXFile()

    const updateActivity = async ({ title, description }: { title: string; description: string }) => {
        await updateActivityMutation.mutateAsync({
            id: activity.id,
            title,
            description
        })

        await queryClient.invalidateQueries({ queryKey: orpcClient.activity.find.key({ input: { activityId } }) })
    }

    const uploadGPXF = async (e: ChangeEvent<HTMLInputElement>) => {
        const inputEl = e.target
        const file = inputEl.files?.[0]
        if (!file) {
            return
        }

        const activity = await uploadGPXFile(file, session.user.id, activityId)
        if (!activity) {
            console.error('Failed to upload activity')
            return
        }
        // Reset the input so selecting the same file again will fire onChange
        inputEl.value = ''

        await queryClient.invalidateQueries({ queryKey: orpcClient.user.activities.all.key() })
    }

    const analyseActivity = async () => {
        await analyseActivityMutation.mutateAsync({ activityId: activity.id })
    }

    const UploadGPX = () => {
        if (activity?.s3Key == null) {
            return (
                <div>
                    <Button className='mx-1 w-1/4' onClick={() => document.getElementById('entryFileUpload')!.click()}>
                        Upload Activity <Upload className='ml-2 h-4 w-4' />
                    </Button>
                    <Input
                        id='entryFileUpload'
                        type='file'
                        accept='.gpx'
                        onChange={e => uploadGPXF(e)} //these should exist
                        className='hidden'
                    />
                </div>
            )
        } else {
            return <></>
        }
    }

    console.log(activity)
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
                <UploadGPX />
                <Separator />
                <ActivityMap raceId={null} windowHeight={600} activityId={activityId} />
            </div>
            <Button onClick={analyseActivity}>Re-Calculate Stats</Button>
            <div>Distance: {activity?.activityAnalysis ? (activity.activityAnalysis.distance / 1852).toFixed(1) + ' NM' : 'unknown'}</div>
            <div>Max Speed: {activity?.activityAnalysis ? (activity.activityAnalysis.maxSpeed * 1.94384449).toFixed(1) + ' Kn' : 'unknown'}</div>
        </PageContainer>
    )
}

export default ActivityViewPage
