'use client'
import CreateEventModal from '@/components/ui/dashboard/CreateEventModal'
import { useSession } from 'next-auth/react'
import * as DB from '@/components/apiMethods'
import { useRouter } from 'next/navigation'

export default function Page() {
    const Router = useRouter()
    const { data: session, status } = useSession()

    const createEvent = async (name: string, numberOfRaces: number) => {
        //create a series
        if (name == '' || numberOfRaces < 1) {
            //show error saying data is invalid
            return
        }
        let series = await DB.createSeries(session!.club.id, name)
        for (let i = 0; i < numberOfRaces; i++) {
            await DB.createRace(session!.club.id, series.id)
        }
        Router.back()
        // mutate('/api/GetTodaysRaceByClubId')
    }

    return (
        <CreateEventModal
            isOpen={true}
            onSubmit={createEvent}
            onClose={() => {
                Router.back()
            }}
        />
    )
}
