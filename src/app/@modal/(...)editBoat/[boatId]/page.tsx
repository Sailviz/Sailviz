'use client'
// Update the import path below to the correct relative path if necessary
import EditResultModal from '@/components/layout/dashboard/EditResultModal'
import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import { use } from 'react'
import * as Fetcher from '@/components/Fetchers'
import CreateResultModal from '@/components/layout/dashboard/CreateResultModal'
import CreateBoatDialog from '@/components/layout/dashboard/CreateBoatModal'

import EditBoatDialog from '@/components/layout/dashboard/EditBoatModal'
import { useSession } from '@/lib/auth-client'
type PageProps = { params: Promise<{ boatId: string }> }

export default function Page(props: PageProps) {
    const Router = useRouter()
    const { boatId } = use(props.params)
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()

    const { boat, boatIsError, boatIsValidating, mutateBoats } = Fetcher.Boat(boatId)

    const editBoat = async (boat: BoatDataType) => {
        await DB.updateBoatById(boat)
        Router.back()
    }

    if (boat == undefined) {
        return <div>Loading...</div>
    }

    return <EditBoatDialog boat={boat} onSubmit={editBoat} />
}
