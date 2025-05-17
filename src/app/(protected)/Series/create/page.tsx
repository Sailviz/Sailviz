'use client'
import CreateSeriesModal from '@/components/ui/dashboard/CreateSeriesModal'
import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import { useSession } from 'next-auth/react'

export default function Page() {
    const Router = useRouter()
    const { data: session, status } = useSession()

    const createSeries = async (name: string) => {
        await DB.createSeries(session!.user.clubId, name)
        Router.back()
    }

    return (
        <CreateSeriesModal
            isOpen={true}
            onSubmit={createSeries}
            onClose={() => {
                Router.back()
            }}
        />
    )
}
