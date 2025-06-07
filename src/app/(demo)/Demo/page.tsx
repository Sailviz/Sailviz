'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import cookie from 'js-cookie'
import * as Fetcher from '@/components/Fetchers'

export default function Page() {
    const Router = useRouter()

    const { GlobalConfig, GlobalConfigIsError, GlobalConfigIsValidating } = Fetcher.UseGlobalConfig()

    const sendLoginRequest = async (uuid: string) => {
        //get csrf token from next-auth
        const csrfRes = await fetch('/api/auth/csrf')
        if (!csrfRes.ok) {
            console.error('Failed to fetch CSRF token:', csrfRes.statusText)
            return
        }
        const { csrfToken } = await csrfRes.json()
        //send manual login request to next-auth
        const res = await fetch('/api/auth/callback/autoLogin', {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ uuid, csrfToken, callbackUrl: '/Dashboard' })
        })
        if (res.ok) {
            console.log(res)
        } else {
            console.error('Login failed:', res.statusText)
            // Handle login failure (e.g., show an error message)
            alert('Login failed. Please try again.')
        }
    }

    useEffect(() => {
        console.log(GlobalConfig)
        const run = async () => {
            //auth ourself
            await sendLoginRequest(GlobalConfig.demoUUID)
            //create a new race for the demo
            let newRace = await DB.createRace(GlobalConfig.demoClubId, GlobalConfig.demoSeriesId)
            newRace = await DB.getRaceById(newRace.id, true)
            //load demo data into the new race
            const demoData = await DB.getRaceById(GlobalConfig.demoDataId, true)
            console.log(newRace)
            //update race data
            await DB.updateRaceById({ ...demoData, id: newRace.id, Type: 'handicap', seriesId: GlobalConfig.demoSeriesId })
            //add results data
            await Promise.all(
                demoData.fleets
                    .flatMap(fleet => fleet.results)
                    .map(result => {
                        return DB.createResult(newRace.fleets[0]!.id).then(newResult => {
                            DB.updateResult({ ...newResult, Helm: result.Helm, Crew: result.Crew, boat: result.boat })
                        })
                    })
            )
            console.log('created demo race')
            // Redirect to another page
            Router.replace(`/Demo/Race/${newRace.id}`)
        }
        run()
    }, [GlobalConfig])

    return (
        <div>
            <p>Setting up practice Mode</p>
        </div>
    )
}
