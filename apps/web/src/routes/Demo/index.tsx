import { useEffect, useState } from 'react'
import { createFileRoute, useLoaderData, useNavigate } from '@tanstack/react-router'
import { client, type Session } from '@sailviz/auth/client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import type { FleetType, RaceType, ResultType } from '@sailviz/types'
import { Spinner } from '@components/ui/spinner'

function Page() {
    const navigate = useNavigate()
    const session: Session = useLoaderData({ from: `__root__` })

    const [statusText, setStatusText] = useState('Initializing...')

    const GlobalConfig = useQuery(orpcClient.globalConfig.find.queryOptions()).data as GlobalConfigType

    const createRaceMutation = useMutation(orpcClient.race.create.mutationOptions())
    const findRaceMutation = useMutation(orpcClient.race.find.mutationOptions())
    const updateRaceMutation = useMutation(orpcClient.race.update.mutationOptions())

    const createResultMutation = useMutation(orpcClient.result.create.mutationOptions())
    const updateResultMutation = useMutation(orpcClient.result.update.mutationOptions())

    const sendLoginRequest = async () => {
        await client.signIn.anonymous()
    }

    useEffect(() => {
        console.log(GlobalConfig)
        const run = async () => {
            //auth ourself
            console.log(session)
            if (session == null) {
                await sendLoginRequest()
            }
            setStatusText('Creating demo race')
            //create a new race for the demo
            let newRace: RaceType = (await createRaceMutation.mutateAsync({ seriesId: GlobalConfig.demoSeriesId })) as RaceType
            console.log(newRace)
            if (newRace.fleets!.length == 0) {
                console.log('no fleets in new race, something went wrong')
                return
            }
            setStatusText('Loading demo data')
            //load demo data into the new race
            const demoData: RaceType = (await findRaceMutation.mutateAsync({ raceId: GlobalConfig.demoDataId })) as RaceType
            console.log('loaded demo data:')
            console.log(demoData)
            //update race data
            await updateRaceMutation.mutateAsync({ ...demoData, id: newRace.id, Type: 'Handicap' })
            //add results data
            setStatusText('Adding Racers')
            await Promise.all(
                demoData
                    .fleets!.flatMap((fleet: FleetType) => fleet.results!)
                    .map((result: ResultType) => {
                        return createResultMutation.mutateAsync({ fleetId: newRace.fleets![0]!.id }).then(newResult => {
                            updateResultMutation.mutateAsync({ ...newResult, Helm: result.Helm, Crew: result.Crew, boat: result.boat, SailNumber: result.SailNumber })
                        })
                    })
            )
            setStatusText('Done')

            // Redirect to another page
            navigate({ to: `/Demo/Race/${newRace.id}` })
        }
        if (GlobalConfig == undefined) {
            return
        }
        run()
    }, [GlobalConfig])

    return (
        <div className='flex flex-col items-center justify-center h-screen gap-4'>
            <p>Setting up practice Mode</p>
            <Spinner size={'large'} />
            <p>{statusText}</p>
        </div>
    )
}

export const Route = createFileRoute('/Demo/')({
    component: Page
})
