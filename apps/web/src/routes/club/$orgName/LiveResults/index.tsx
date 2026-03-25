import { useEffect, useState, useCallback } from 'react'

import { createFileRoute } from '@tanstack/react-router'
import LiveFleetResultsTable from '@components/tables/LiveFleetResultsTable'
import RaceTimer from '@components/HRaceTimer'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import * as Types from '@sailviz/types'

enum pageModes {
    live,
    notLive
}

function Page() {
    const { orgName } = Route.useParams()
    const org = useQuery(orpcClient.organization.name.queryOptions({ input: { orgName: orgName! } })).data as Types.Org
    const stripe = useQuery(orpcClient.stripe.org.queryOptions({ input: { orgId: org?.id } })).data
    const races = useQuery(orpcClient.race.today.queryOptions({ input: { orgId: org?.id } })).data

    const queryClient = useQueryClient()

    const findRaceMutation = useMutation(orpcClient.race.find.mutationOptions())

    var [activeRace, setActiveRace] = useState<Types.RaceType>({
        id: '',
        number: 0,
        Time: '',
        Duties: [{} as DutyDataType],
        fleets: [],
        Type: '',
        seriesId: '',
        series: {} as SeriesDataType
    } as unknown as Types.RaceType)

    var [mode, setMode] = useState<pageModes>(pageModes.notLive)

    const checkActive = useCallback((race: Types.RaceType) => {
        if (!race.fleets || race.fleets.length === 0) {
            console.error('no fleets found')
            return false
        }

        // Check if any fleets have started and not all boats have finished
        return (
            race.fleets.some(fleet => fleet.startTime !== 0) &&
            !race.fleets
                .flatMap(fleet => fleet.results)
                .every(result => {
                    return result?.finishTime !== 0 || result?.resultCode !== ''
                })
        )
    }, [])

    useEffect(() => {
        const timer1 = setInterval(async () => {
            let activeFlag = false

            if (!races) {
                queryClient.invalidateQueries({
                    queryKey: orpcClient.race.today.key({ type: 'query' })
                })
                return
            }

            for (const race of races) {
                const updatedRace = await findRaceMutation.mutateAsync({ raceId: race.id })

                if (checkActive(updatedRace)) {
                    setMode(pageModes.live)
                    setActiveRace(updatedRace)

                    activeFlag = true
                    break
                }
            }

            if (!activeFlag) {
                setMode(pageModes.notLive)
            }
        }, 5000)

        return () => clearInterval(timer1)
    }, [races, checkActive, findRaceMutation, queryClient])

    return (
        <div>
            {(() => {
                switch (mode) {
                    case pageModes.live:
                        return (
                            <div>
                                <div className='w-1/4 p-2 m-2 border-4 rounded-lg bg-white text-lg font-medium'>
                                    Race Time:{' '}
                                    <RaceTimer
                                        fleetId={activeRace.fleets[0].id}
                                        startTime={activeRace.fleets[0].startTime}
                                        timerActive={true}
                                        onFiveMinutes={null}
                                        onFourMinutes={null}
                                        onOneMinute={null}
                                        onGo={null}
                                        onWarning={null}
                                        reset={false}
                                    />
                                </div>
                                <div className='m-6'>
                                    <div className='text-4xl font-extrabold text-gray-700 p-6'>
                                        {activeRace.series?.name}: {activeRace.number} - {activeRace.fleets[0].fleetSettings.name}
                                    </div>
                                    <LiveFleetResultsTable raceId={activeRace.id} startTime={activeRace.fleets[0].startTime} handicap={activeRace.Type} />
                                </div>
                            </div>
                        )
                    default:
                        return (
                            <div>
                                <p className='text-6xl font-extrabold text-gray-700 p-6'>{org?.name}</p>
                                {stripe?.planName !== 'SailViz' ? (
                                    <p className='text-2xl font-extrabold text-gray-700 p-6'>No Races Currently Active</p>
                                ) : (
                                    <p className='text-2xl font-extrabold text-gray-700 p-6'>Upgrade to Sailviz Pro to enable Live Results</p>
                                )}
                            </div>
                        )
                }
            })()}
        </div>
    )
}

export const Route = createFileRoute('/club/$orgName/LiveResults/')({
    component: Page
})
