import { useEffect, useState } from 'react'

import { createFileRoute } from '@tanstack/react-router'
import LiveFleetResultsTable from '@components/tables/LiveFleetResultsTable'
import RaceTimer from '@components/HRaceTimer'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import type { ClubType, RaceType } from '@sailviz/types'

enum pageModes {
    live,
    notLive
}

function Page() {
    const { clubName } = Route.useParams()
    const club = useQuery(orpcClient.club.name.queryOptions({ input: { clubName: clubName! } })).data as ClubType
    const races = useQuery(orpcClient.race.today.queryOptions({ input: { clubId: club!.id }, queryKey: [club] })).data

    const queryClient = useQueryClient()

    const findRaceMutation = useMutation(orpcClient.race.find.mutationOptions())

    var [activeRace, setActiveRace] = useState<RaceType>({
        id: '',
        number: 0,
        Time: '',
        Duties: [{} as DutyDataType],
        fleets: [],
        Type: '',
        seriesId: '',
        series: {} as SeriesDataType
    } as RaceType)

    var [mode, setMode] = useState<pageModes>(pageModes.notLive)

    const checkActive = (race: RaceType) => {
        if (race.fleets == undefined) {
            console.error('no fleets found')
            return false
        }
        if (race.fleets.length == 0) {
            console.error('no fleets found')
        }

        //if any fleets have been started
        if (race.fleets.some(fleet => fleet.startTime != 0)) {
            //race has started, check if all boats have finished
            return !race.fleets
                .flatMap(fleet => fleet.results)
                .every(result => {
                    if (result!.finishTime != 0) {
                        return true
                    }
                })
        }
        return false
    }

    useEffect(() => {
        races?.forEach(race => {
            if (checkActive(race)) {
                setMode(pageModes.live)
                setActiveRace(race)
            }
        })
    }, [races])

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
            //check if any of the races are active
            for (let race of races) {
                race = await findRaceMutation.mutateAsync({ raceId: race.id })
                if (checkActive(race)) {
                    setMode(pageModes.live)
                    setActiveRace(race)
                    activeFlag = true
                    break
                }
            }
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
                                {activeRace.fleets!.map(fleet => {
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
                                <p className='text-6xl font-extrabold text-gray-700 p-6'>{club?.name}</p>
                                {/* this backwards case is so that the upgrade message isn't shown during page load. */}
                                {club?.stripe.planName != 'SailViz' ? (
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

export const Route = createFileRoute('/club/$clubName/LiveResults/')({
    component: Page
})
