import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { PageSkeleton } from '@components/layout/PageSkeleton'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@components/helpers/users'
import { title } from '@components/layout/home/primitaves'
import { type Session } from '@sailviz/auth/client'
import { useEffect, useState } from 'react'
import { Input } from '@components/ui/input'
import { ActionButton } from '@components/ui/action-button'
import { useMutation, useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'

function Page() {
    const session: Session = useLoaderData({ from: `__root__` })

    const { data: org } = useQuery(orpcClient.organization.session.queryOptions())

    const orgUpdateMutation = useMutation(orpcClient.organization.update.mutationOptions())

    const [trackableOrgId, setTrackableOrgId] = useState<string>('')

    const updateOrgIg = async () => {
        if (!org) return
        const updatedOrg = org
        updatedOrg.orgData!.trackableOrgId = trackableOrgId
        await orgUpdateMutation.mutateAsync(updatedOrg)
    }

    useEffect(() => {
        if (org) {
            setTrackableOrgId(org.orgData!.trackableOrgId || '')
        }
    }, [org])

    if (session == undefined || org == null) {
        return <PageSkeleton />
    }

    if (!org.orgData!.trackableEnabled) {
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

export const Route = createFileRoute('/Dashboard/Trackable/')({
    component: Page
})
