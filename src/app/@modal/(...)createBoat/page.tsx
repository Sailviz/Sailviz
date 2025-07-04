'use client'
// Update the import path below to the correct relative path if necessary
import EditResultModal from '@/components/layout/dashboard/EditResultModal'
import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import { use } from 'react'
import * as Fetcher from '@/components/Fetchers'
import CreateResultModal from '@/components/layout/dashboard/CreateResultModal'
import CreateBoatDialog from '@/components/layout/dashboard/CreateBoatModal'
import { useSession } from '@/lib/auth-client'
import { mutate } from 'swr'

export default function Page() {
    const Router = useRouter()
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()

    const createBoat = async (boat: BoatDataType) => {
        await DB.createBoat(boat.name, boat.crew, boat.py, boat.pursuitStartTime, session!.user.clubId)
        mutate('/api/GetBoats')
        Router.back()
    }

    return <CreateBoatDialog onSubmit={createBoat} />
}
