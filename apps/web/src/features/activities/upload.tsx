import { orpcClient } from '@lib/orpc'
import { useMutation } from '@tanstack/react-query'

export function useUploadGPXFile() {
    const uploadUrlMutation = useMutation(orpcClient.activity.createUploadUrl.mutationOptions())
    const saveMetadataMutation = useMutation(orpcClient.activity.saveMetadata.mutationOptions())

    const uploadGPXFile = async (file: File, userId: string) => {
        const uploadUrl = await uploadUrlMutation.mutateAsync({
            userId
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
            id: uploadUrl.id,
            s3key: uploadUrl.key
        })

        return activity
    }
    return { uploadGPXFile }
}
