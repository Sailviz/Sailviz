'use client'
import React, { ChangeEvent, MouseEventHandler, use, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import { useReactToPrint } from 'react-to-print'
import HandicapPaperResultsTable from '@/components/tables/HandicapPaperResultsTable'
import PursuitPaperResultsTable from '@/components/tables/PursuitPaperResultsTable'
import dayjs from 'dayjs'
import ReactDOM from 'react-dom'

type PageProps = { params: Promise<{ slug: string }> }

export default function Page(props: PageProps) {
    const Router = useRouter()

    const { slug } = use(props.params)

    var [race, setRace] = useState<RaceDataType>({
        id: '',
        number: 0,
        Time: '',
        Duties: [{} as DutyDataType],
        fleets: [
            {
                id: '',
                startTime: 0,
                raceId: '',
                fleetSettings: {
                    id: '',
                    name: '',
                    boats: [],
                    startDelay: 0,
                    fleets: []
                } as FleetSettingsType,
                results: [
                    {
                        id: '',
                        Helm: '',
                        Crew: '',
                        boat: {
                            py: 0,
                            pursuitStartTime: 0
                        } as BoatDataType,
                        SailNumber: '',
                        finishTime: 0,
                        CorrectedTime: 0,
                        laps: [
                            {
                                time: 0,
                                id: '',
                                resultId: ''
                            }
                        ],
                        PursuitPosition: 0,
                        HandicapPosition: 0,
                        resultCode: '',
                        fleetId: ''
                    } as ResultDataType
                ]
            }
        ],
        Type: 'Handicap',
        seriesId: '',
        series: {} as SeriesDataType
    })

    const contentRef = useRef<HTMLDivElement>(null)

    const handlePrint = useReactToPrint({
        contentRef,
        onAfterPrint: () => {
            Router.back()
        }
    })

    useEffect(() => {
        const getRace = async () => {
            const racedata = await DB.getRaceById(slug!)
            setRace(racedata)
            DB.GetSeriesById(racedata.seriesId).then(series => series.name)
        }

        if (slug != undefined) {
            getRace()
        }
    }, [Router, slug])

    useEffect(() => {
        if (race.id != '') {
            handlePrint()
        }
    }, [race])

    return (
        <div className='h-full overflow-y-auto p-6' ref={contentRef}>
            {race!.fleets.map((fleet, index) => {
                return (
                    <div key={'fleetResults' + index}>
                        <p className='text-2xl'>
                            {race.series.name} - Race {race.number} ({dayjs(race.Time).format('DD/MM/YYYY HH:mm')}) - {fleet.fleetSettings.name}
                        </p>
                        {race.Type == 'Handicap' ? (
                            <HandicapPaperResultsTable results={race.fleets.flatMap(fleet => fleet.results)} key={JSON.stringify(race)} />
                        ) : (
                            <PursuitPaperResultsTable results={race.fleets.flatMap(fleet => fleet.results)} key={JSON.stringify(race)} />
                        )}
                    </div>
                )
            })}
        </div>
    )
}
