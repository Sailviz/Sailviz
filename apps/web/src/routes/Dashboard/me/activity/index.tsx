import PageContainer from '@components/layout/page-container'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { DataTableSkeleton } from '@components/ui/table/data-table-skeleton'
import { useUploadGPXFile } from '@features/activities/upload'
import UserActivitiesTable from '@features/user/activities-table'
import { orpcClient } from '@lib/orpc'
import type { Session } from '@lib/session'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { Upload } from 'lucide-react'
import { Suspense, type ChangeEvent } from 'react'

function Page() {
    const session: Session = useLoaderData({ from: `__root__` })
    const { uploadGPXFile } = useUploadGPXFile()
    const queryClient = useQueryClient()

    const createActivityMutation = useMutation(orpcClient.activity.create.mutationOptions())

    const createActivity = async (e: ChangeEvent<HTMLInputElement>) => {
        const { id: activityId } = await createActivityMutation.mutateAsync({ userId: session.user.id })

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

    return (
        <PageContainer scrollable={false}>
            <div className='flex flex-row'>
                <Button className='mx-1 w-1/4' onClick={() => document.getElementById('entryFileUpload')!.click()}>
                    Upload Activity <Upload className='ml-2 h-4 w-4' />
                </Button>
                <Input
                    id='entryFileUpload'
                    type='file'
                    accept='.gpx'
                    onChange={e => createActivity(e)} //these should exist
                    className='hidden'
                />
            </div>
            <div className='flex flex-1 flex-col space-y-4'>
                <Suspense fallback={<DataTableSkeleton columnCount={3} rowCount={10} />}>
                    <UserActivitiesTable />
                </Suspense>
            </div>
        </PageContainer>
    )
}

export const Route = createFileRoute('/Dashboard/me/activity/')({
    component: Page
})
