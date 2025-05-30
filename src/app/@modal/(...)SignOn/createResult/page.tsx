'use client'
import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import { use } from 'react'
import * as Fetcher from '@/components/Fetchers'
import CreateResultModal from '@/components/layout/SignOn/CreateResultModal'
import { useSession } from 'next-auth/react'
type PageProps = { params: Promise<{ raceId: string }> }

export default function Page(props: PageProps) {
    const { data: session, status } = useSession()
    const Router = useRouter()
    const { raceId } = use(props.params)

    const { todaysRaces, todaysRacesIsError, todaysRacesIsValidating } = Fetcher.GetTodaysRaceByClubId(session?.club!)
    const { boats, boatsIsError, boatsIsValidating } = Fetcher.Boats()

    const createResult = async (fleetId: string, helm: string, crew: string, boat: BoatDataType, sailNum: string) => {
        console.log('createResult', fleetId, helm, crew, boat, sailNum)
        //create a result for each fleet
        let result = await DB.createResult(fleetId)
        await DB.updateResult({ ...result, Helm: helm, Crew: crew, boat: boat, SailNumber: sailNum })

        console.log(helm, crew, boat, sailNum, fleetId)
        Router.back()
    }

    if (todaysRaces == undefined) {
        return <div>Loading...</div>
    }

    console.log('todaysRaces', todaysRaces)
    return <CreateResultModal races={todaysRaces} boats={boats} onSubmit={createResult} />
}
