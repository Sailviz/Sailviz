'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import cookie from 'js-cookie'
import * as Fetcher from '@/components/Fetchers'

export default function DemoPage({ params }: { params: { slug: string } }) {
    const Router = useRouter()

    const { GlobalConfig, GlobalConfigIsError, GlobalConfigIsValidating } = Fetcher.UseGlobalConfig()

    useEffect(() => {
        const run = async () => {
            // set user cookies if they don't exist
            console.log(cookie.get('userId'))
            if (cookie.get('userId')) {
                //store cookie in local storage to retrieve later
                localStorage.setItem('userId', cookie.get('userId')!)
            }
            if (cookie.get('clubId')) {
                //store cookie in local storage to retrieve later
                localStorage.setItem('clubId', cookie.get('clubId')!)
            }
            if (cookie.get('token')) {
                //store cookie in local storage to retrieve later
                localStorage.setItem('token', cookie.get('token')!)
            }
            const body = { uuid: GlobalConfig.demoUUID }
            const res = await fetch(`/api/autoAuthenticate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })
                .then(r => r.json())
                .then(data => {
                    console.log(data)
                    if (data && data.error) {
                        console.log(data.error)
                    }
                    if (data && data.token) {
                        //set cookie
                        cookie.set('token', data.token, { expires: 2 })
                        cookie.set('clubId', data.user.clubId, { expires: 2 })
                        cookie.set('userId', data.user.id, { expires: 2 })
                    } else {
                        console.error('no token with login request')
                        console.log(data)
                    }
                })

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
