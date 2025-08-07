'use client'
import { use } from 'react'
import * as Fetcher from '@/components/Fetchers'
import EditBoatDialog from '@/components/layout/dashboard/EditBoatModal'
type PageProps = { params: Promise<{ boatId: string }> }

export default function Page(props: PageProps) {
    const { boatId } = use(props.params)

    const { boat, boatIsError, boatIsValidating } = Fetcher.Boat(boatId)

    if (boat == undefined) {
        return <div>Loading...</div>
    }

    return <EditBoatDialog boat={boat} />
}
