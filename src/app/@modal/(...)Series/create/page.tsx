'use client'
// Update the import path below to the correct relative path if necessary
import CreateSeriesModal from '@/components/layout/dashboard/CreateSeriesModal'
import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import { useSession } from 'next-auth/react'
export default function Page() {
    const { data: session, status } = useSession()
    const Router = useRouter()

    const createSeries = async (seriesName: string) => {
        // Here you would typically call an API to create the series
        // For example:
        await DB.createSeries(session?.user?.clubId!, seriesName)
        // After creating the series, you might want to redirect or update the UI
        Router.back()
    }
    return (
        <CreateSeriesModal
            onSubmit={createSeries}
            onClose={() => {
                Router.back()
            }}
        />
    )
}
