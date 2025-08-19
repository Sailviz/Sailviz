'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import cookie from 'js-cookie'
import * as Fetcher from '@/components/Fetchers'
import { client, useSession } from '@/lib/auth-client'

export default function Page() {
    const Router = useRouter()
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()

    const { GlobalConfig, GlobalConfigIsError, GlobalConfigIsValidating } = Fetcher.UseGlobalConfig()

    const sendLoginRequest = async (uuid: string) => {
        // @ts-ignore not sure why this is needed, but it is
        const res = await client.myPlugin.authByUuid({ uuid, fetchOptions: { method: 'POST' } })
        console.log(res)
    }

    useEffect(() => {
        console.log(GlobalConfig)
        const run = async () => {
            //auth ourself
            console.log(session)
            if (session == null) {
                await sendLoginRequest(GlobalConfig.demoUUID)
            }
            //create a new race for the demo
            let newRace = await DB.createRace(GlobalConfig.demoClubId, GlobalConfig.demoSeriesId)
            newRace = await DB.getRaceById(newRace.id, true)
            //load demo data into the new race
            const demoData = await DB.getRaceById(GlobalConfig.demoDataId, true)
            console.log(newRace)
            //update race data
            await DB.updateRaceById({ ...demoData, id: newRace.id, Type: 'Handicap', seriesId: GlobalConfig.demoSeriesId })
            //add results data
            await Promise.all(
                demoData.fleets
                    .flatMap(fleet => fleet.results)
                    .map(result => {
                        return DB.createResult(newRace.fleets[0]!.id).then(newResult => {
                            DB.updateResult({ ...newResult, Helm: result.Helm, Crew: result.Crew, boat: result.boat, SailNumber: result.SailNumber })
                        })
                    })
            )
            console.log('created demo race')
            // Redirect to another page
            Router.replace(`/Demo/Race/${newRace.id}`)
        }
        if (GlobalConfig == undefined || GlobalConfigIsValidating) {
            return
        }
        run()
    }, [GlobalConfig])

    return (
        <div>
            <p>Setting up practice Mode</p>
        </div>
    )
}
