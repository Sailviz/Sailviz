import { orpcClient } from '@lib/orpc'
import { useMutation } from '@tanstack/react-query'

export function useUploadGPXFile() {
    const uploadUrlMutation = useMutation(orpcClient.activity.createUploadUrl.mutationOptions())
    const saveMetadataMutation = useMutation(orpcClient.activity.saveMetadata.mutationOptions())

    const uploadGPXFile = async (file: File, userId: string, activityId: string) => {
        const uploadUrl = await uploadUrlMutation.mutateAsync({
            userId,
            activityId
        })
        console.log(uploadUrl)
        const res = await fetch(uploadUrl.uploadUrl, {
            method: 'PUT',
            body: file
        })

        if (!res.ok) {
            console.error('Failed to upload file', res.statusText)
            return
        }
        const activity = await saveMetadataMutation.mutateAsync({
            activityId: activityId,
            s3key: uploadUrl.key
        })

        return activity
    }
    return { uploadGPXFile }
}
