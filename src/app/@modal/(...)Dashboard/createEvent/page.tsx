'use client'
import CreateEventModal from '@/components/layout/dashboard/CreateEventModal'

import * as DB from '@/components/apiMethods'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'

export default function Page() {
    const Router = useRouter()
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()

    const createEvent = async (name: string, numberOfRaces: number) => {
        //create a series
        if (name == '' || numberOfRaces < 1) {
            //show error saying data is invalid
            return
        }
        let series = await DB.createSeries(session!.club!.id, name)
        for (let i = 0; i < numberOfRaces; i++) {
            await DB.createRace(session!.club!.id, series.id)
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
