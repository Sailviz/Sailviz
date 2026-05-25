import { type ChangeEvent } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useMutation } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import type { Session } from '@lib/session'
import { useLoaderData } from '@tanstack/react-router'

export function ImageUpload({ buttonText }: { buttonText: string }) {
    const session: Session = useLoaderData({ from: `__root__` })

    const uploadUrlMutation = useMutation(orpcClient.image.createUploadUrl.mutationOptions())
    const saveMetadataMutation = useMutation(orpcClient.image.saveMetadata.mutationOptions())

    const entryFileUploadHandler = async (e: ChangeEvent<HTMLInputElement>) => {
        const inputEl = e.target
        const file = inputEl.files?.[0]
        if (!file) {
            return
        }
        // Reset the input so selecting the same file again will fire onChange
        inputEl.value = ''

        const uploadUrl = await uploadUrlMutation.mutateAsync({
            ownerType: 'organisation',
            category: 'banner',
            ownerId: session.session.activeOrganizationId ?? null
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
        await saveMetadataMutation.mutateAsync({
            id: uploadUrl.id,
            s3key: uploadUrl.key,
            ownerType: 'organisation',
            category: 'banner',
            ownerId: session.session.activeOrganizationId
        })
    }

    return (
        <>
            <Button className='mx-1' onClick={() => document.getElementById('entryFileUpload')!.click()}>
                {buttonText}
            </Button>
            <Input id='entryFileUpload' type='file' accept='.png' onChange={e => entryFileUploadHandler(e)} className='hidden' />
        </>
    )
}
