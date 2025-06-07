'use client'
// Update the import path below to the correct relative path if necessary
import EditResultModal from '@/components/layout/dashboard/EditResultModal'
import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import { use } from 'react'
import * as Fetcher from '@/components/Fetchers'
import EditFleetSettingsDialog from '@/components/layout/dashboard/EditFleetSettingsModal'
type PageProps = { params: Promise<{ fleetId: string }> }

export default function Page(props: PageProps) {
    const Router = useRouter()
    const { fleetId } = use(props.params)

    const { fleetSettings, fleetSettingsIsError, fleetSettingsIsValidating } = Fetcher.FleetSettings(fleetId)

    const updateFleet = async (fleet: FleetSettingsType): Promise<void> => {
        await DB.updateFleetSettingsById(fleet)
        Router.back()
    }
    console.log('fleetSettings', fleetSettings)

    if (fleetSettings == undefined) {
        return <div>Loading...</div>
    }

    return <EditFleetSettingsDialog fleetSettings={fleetSettings} onSubmit={updateFleet} />
}
