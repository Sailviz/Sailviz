import { useEffect, useState } from 'react'

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

    const checkActive = (race: Types.RaceType) => {
        if (race.fleets!.length == 0) {
            console.error('no fleets found')
        }

        //if any fleets have been started
        if (race.fleets!.some(fleet => fleet.startTime != 0)) {
            //race has started, check if all boats have finished
            return !race
                .fleets!.flatMap(fleet => fleet.results)
                .every(result => {
                    if (result!.finishTime != 0 || result!.resultCode != '') {
                        return true
                    }
                })
        }
        return false
    }

    useEffect(() => {
        const timer1 = setTimeout(async () => {
            let activeFlag = false
            console.log('refreshing results')
            if (races == undefined) {
                console.error('races undefined')
                queryClient.invalidateQueries({
                    queryKey: orpcClient.race.today.key({ type: 'query' })
                })
                return
            }
            console.log(races)
            //check if any of the races are active
            races.forEach(async race => {
                race = await findRaceMutation.mutateAsync({ raceId: race.id })
                if (checkActive(race)) {
                    setMode(pageModes.live)
                    setActiveRace(race)
                    activeFlag = true
                }
            })
            if (!activeFlag) {
                setMode(pageModes.notLive)
            }
        }, 5000)
        return () => {
            clearTimeout(timer1)
        }
    }, [races, activeRace])

    return (
        <div>
            {(() => {
                switch (mode) {
                    case pageModes.live:
                        return (
                            <div key={JSON.stringify(activeRace)}>
                                {activeRace.fleets?.map(fleet => {
                                    //change this to select the active race.
                                    return (
                                        <>
                                            <div className='w-1/4 p-2 m-2 border-4 rounded-lg bg-white text-lg font-medium'>
                                                <div key={fleet.id}>
                                                    Race Time:{' '}
                                                    <RaceTimer
                                                        fleetId={fleet.id}
                                                        startTime={fleet.startTime}
                                                        timerActive={true}
                                                        onFiveMinutes={null}
                                                        onFourMinutes={null}
                                                        onOneMinute={null}
                                                        onGo={null}
                                                        onWarning={null}
                                                        reset={false}
                                                    />
                                                </div>
                                            </div>
                                            <div className='m-6' key={activeRace.id}>
                                                <div className='text-4xl font-extrabold text-gray-700 p-6'>
                                                    {activeRace.series!.name}: {activeRace.number} - {fleet.fleetSettings.name}
                                                </div>
                                                <LiveFleetResultsTable fleet={fleet} startTime={fleet.startTime} handicap={activeRace.Type} />
                                            </div>
                                        </>
                                    )
                                })}
                            </div>
                        )
                    default: //includes notLive state
                        return (
                            <div>
                                <p className='text-6xl font-extrabold text-gray-700 p-6'>{org?.name}</p>
                                {/* this backwards case is so that the upgrade message isn't shown during page load. */}
                                {stripe?.planName != 'SailViz' ? (
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
