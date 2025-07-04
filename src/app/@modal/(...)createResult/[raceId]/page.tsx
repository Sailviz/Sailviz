'use client'
// Update the import path below to the correct relative path if necessary
import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import { use } from 'react'
import * as Fetcher from '@/components/Fetchers'
import CreateResultModal from '@/components/layout/dashboard/CreateResultModal'
import { mutate } from 'swr'
type PageProps = { params: Promise<{ raceId: string }> }

export default function Page(props: PageProps) {
    const Router = useRouter()
    const { raceId } = use(props.params)

    const { race, raceIsError, raceIsValidating } = Fetcher.Race(raceId, false)
    const { boats, boatsIsError, boatsIsValidating } = Fetcher.Boats()

    const createResult = async (helm: string, crew: string, boat: BoatDataType, sailNum: string, fleetId: string) => {
        //create a result for each fleet
        let result = await DB.createResult(fleetId)
        await DB.updateResult({ ...result, Helm: helm, Crew: crew, boat: boat, SailNumber: sailNum })

        console.log(helm, crew, boat, sailNum, fleetId)
        mutate(`/api/GetRaceById?id=${raceId}&results=true`)

        Router.back()
    }

    console.log(race, boats)
    if (race == undefined || boats == undefined) {
        return <div>Loading...</div>
    }

    console.log('race', race)

    return <CreateResultModal race={race} boats={boats} onSubmit={createResult} />
}
