import { useEffect, useState, useCallback } from 'react'
import LiveFleetResultsTable from '@components/tables/LiveFleetResultsTable'
import RaceTimer from '@components/HRaceTimer'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import * as Types from '@sailviz/types'

enum pageModes {
    live,
    notLive
}

const LiveResultsViewPage = ({ orgName }: { orgName: string }) => {
    const org = useQuery(orpcClient.organization.name.queryOptions({ input: { orgName: orgName! } })).data as Types.Org
    const stripe = useQuery(orpcClient.stripe.org.queryOptions({ input: { orgId: org?.id }, enabled: org != undefined })).data
    const races = useQuery(orpcClient.race.today.queryOptions({ input: { orgId: org?.id }, enabled: org != undefined })).data

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

        if (race.Type == 'Handicap') {
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
        } else if (race.Type == 'Pursuit') {
            //if any fleets have been started
            if (race.fleets!.some(fleet => fleet.startTime != 0)) {
                //this returns true if the race is still running, and false if the race has finished.
                return race.fleets[0]!.startTime + race.series?.settings.pursuitLength * 60 > Math.floor(new Date().getTime() / 1000)
            }
        }
        return false
    }, [])

    const findActiveRace = async () => {
        let activeFlag = false

        if (!races) {
            queryClient.invalidateQueries({
                queryKey: orpcClient.race.today.key({ type: 'query' })
            })
            setTimeout(findActiveRace, 10000) // Check again in 10 seconds

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
        setTimeout(findActiveRace, 10000) // Check again in 10 seconds
    }

    useEffect(() => {
        findActiveRace()
    }, [races])

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
                                {activeRace.fleets.map(fleet => (
                                    <div className='m-6'>
                                        <div className='text-4xl font-extrabold text-gray-700 p-6'>
                                            {activeRace.series?.name}: {activeRace.number} - {fleet.fleetSettings.name}
                                        </div>
                                        <LiveFleetResultsTable fleetId={fleet.id} startTime={fleet.startTime} handicap={activeRace.Type} />
                                    </div>
                                ))}
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

export default LiveResultsViewPage
