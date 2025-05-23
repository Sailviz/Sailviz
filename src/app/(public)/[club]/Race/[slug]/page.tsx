'use client'
import { useEffect, useState } from 'react'
import Layout from '@/components/layout/Layout'

import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import LiveFleetResultsTable from '@/components/tables/LiveFleetResultsTable'
import RaceTimer from '@/components/HRaceTimer'
import FleetResultsTable from '@/components/tables/FleetHandicapResultsTable'
import FleetHandicapResultsTable from '@/components/tables/FleetHandicapResultsTable'
import FleetPursuitResultsTable from '@/components/tables/FleetPursuitResultsTable'
import { title, subtitle } from '@/components/layout/home/primitaves'

type PageProps = { params: Promise<{ slug: string }> }

export default async function Page(props: PageProps) {
    const Router = useRouter()

    const params = await props.params

    var [race, setRace] = useState<RaceDataType>({
        id: '',
        number: 0,
        Time: '',
        Duties: [{} as DutyDataType],
        fleets: [
            {
                raceId: '',
                id: '',
                name: '',
                boats: [],
                startDelay: 0,
                results: [],
                startTime: 0,
                fleetSettings: {} as FleetSettingsType
            } as FleetDataType
        ],
        Type: '',
        seriesId: '',
        series: {} as SeriesDataType
    })
    var [seriesName, setSeriesName] = useState<string>('')

    useEffect(() => {
        //store club id into cookies so that it can be used for api calls
        let raceId = params.slug
        const getRace = async () => {
            const racedata = await DB.getRaceById(raceId)
            setRace(racedata)
            DB.GetSeriesById(racedata.seriesId).then((series: SeriesDataType) => {
                setSeriesName(series.name)
            })
        }

        if (raceId != undefined) {
            getRace()
        }
    }, [Router])

    // list of current series
    //list of

    return (
        <div className='m-6 panel-height w-full overflow-y-auto'>
            <div className='py-4 w-full'>
                <div className='py-4'>
                    <div className={title({ color: 'blue' })}>{seriesName}</div>
                </div>
                {race.fleets.map((fleet, index) => {
                    return (
                        <div key={'fleetResults' + index}>
                            {race.Type == 'Handicap' ? (
                                <FleetHandicapResultsTable
                                    showTime={true}
                                    editable={false}
                                    fleetId={fleet.id}
                                    key={JSON.stringify(race)}
                                    deleteResult={null}
                                    updateResult={null}
                                    raceId={race.id}
                                    showEditModal={null}
                                />
                            ) : (
                                <FleetPursuitResultsTable
                                    showTime={true}
                                    editable={false}
                                    fleetId={fleet.id}
                                    key={JSON.stringify(race)}
                                    deleteResult={null}
                                    updateResult={null}
                                    raceId={race.id}
                                    showEditModal={null}
                                />
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
