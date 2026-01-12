import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { PageSkeleton } from '@components/layout/PageSkeleton'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@components/helpers/users'
import { title } from '@components/layout/home/primitaves'
import { client, type Session } from '@sailviz/auth/client'
import { useEffect, useState } from 'react'
import { Input } from '@components/ui/input'
import { ActionButton } from '@components/ui/action-button'

function Page() {
    const session: Session = useLoaderData({ from: `__root__` })

    const [trackableOrgId, setTrackableOrgId] = useState<string>('')
    const [org, setOrg] = useState<any>(null)
    const [metadata, setMetadata] = useState<any>(null)
    useEffect(() => {
        async function fetchActiveOrg() {
            const { data: org } = await client.organization.getFullOrganization()

            const metadata = JSON.parse(org!.metadata)
            console.log('Org metadata:', metadata)
            setMetadata(metadata)
            setTrackableOrgId(metadata.trackable.orgId || '')
            setOrg(org)
        }
        fetchActiveOrg()
    }, [])

    const updateOrgIg = async () => {
        const updatedMetadata = metadata
        updatedMetadata.trackable.orgId = trackableOrgId
        await client.organization.update({
            data: {
                metadata: updatedMetadata
            },
            organizationId: org.id
        })
    }

    if (session == undefined || org == null) {
        return <PageSkeleton />
    }

    if (!metadata.trackable.enabled) {
        return (
            <div>
                <p>Trackable is not enabled for your club, contact support for more information</p>
            </div>
        )
    }

    if (!userHasPermission(session.user, AVAILABLE_PERMISSIONS.trackableView)) {
        return (
            <div>
                <p> These Settings are unavailable to you.</p>
            </div>
        )
    }

    return (
        <div>
            <div className='p-6'>
                <h1 className={title({ color: 'blue' })}>Trackable Settings</h1>
            </div>
            <Input className='mx-6 mb-4' placeholder='Trackable Org Id' value={trackableOrgId} onChange={v => setTrackableOrgId(v.target.value)} />
            <ActionButton before='Save' during='Saving' after='Saved' action={updateOrgIg} />
        </div>
    )
}

export const Route = createFileRoute('/dashboard/Trackable/')({
    component: Page
})
