'use client'
import React, { ChangeEvent, MouseEventHandler, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import * as DB from 'components/apiMethods';
import { useReactToPrint } from "react-to-print";
import HandicapPaperResultsTable from "components/tables/HandicapPaperResultsTable";
import PursuitPaperResultsTable from "components/tables/PursuitPaperResultsTable";
import dayjs from "dayjs";

export default function Page({ params }: { params: { slug: string } }) {

    const Router = useRouter()

    const searchParams = useSearchParams()

    var [race, setRace] = useState<RaceDataType>({
        id: "",
        number: 0,
        Time: "",
        Duties: [{} as DutyDataType],
        fleets: [{
            id: "",
            startTime: 0,
            raceId: "",
            fleetSettings: {
                id: "",
                name: "",
                boats: [],
                startDelay: 0,
                fleets: []
            } as FleetSettingsType,
            results: [{
                id: "",
                raceId: "",
                Helm: "",
                Crew: "",
                boat: {
                    py: 0,
                    pursuitStartTime: 0,
                } as BoatDataType,
                SailNumber: "",
                finishTime: 0,
                CorrectedTime: 0,
                laps: [{
                    time: 0,
                    id: "",
                    resultId: ""
                }],
                PursuitPosition: 0,
                HandicapPosition: 0,
                resultCode: "",
                fleetId: ""
            } as ResultsDataType]

        }],
        Type: "Handicap",
        seriesId: "",
        series: {} as SeriesDataType
    })

    const contentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        content: () => contentRef.current as any,
        onAfterPrint: () => {
            Router.back()
        }
    });

    useEffect(() => {
        let raceId = params.slug
        console.log(raceId)
        const getRace = async () => {
            const racedata = await DB.getRaceById(raceId!)
            setRace(racedata)
            DB.GetSeriesById(race.seriesId).then(series => series.name)
        }

        if (raceId != null) {
            getRace()
        }

    }, [Router])

    useEffect(() => {
        if (race.id != "") {
            handlePrint()
        }
    }, [race])


    return (
        <div className="h-full overflow-y-auto p-6" ref={contentRef}>
            <p className="text-2xl">{race.series.name} - Race {race.number} ({dayjs(race.Time).format('DD/MM/YYYY HH:mm')})</p>
            {race.Type == "Handicap" ?
                <HandicapPaperResultsTable results={race.fleets.flatMap(fleet => fleet.results)} key={JSON.stringify(race)} />
                :
                <PursuitPaperResultsTable results={race.fleets.flatMap(fleet => fleet.results)} key={JSON.stringify(race)} />
            }
        </div>
    )
}